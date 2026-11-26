import argparse
import json
import re
import subprocess
from pathlib import Path

crate = Path(__file__).resolve().parent
spec = json.loads((crate.parents[1] / "sdk/openapi.json").read_text())
definitions = {}
methods = []
keywords = set("as break const continue crate else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while async await dyn abstract become box do final gen macro override priv try typeof unsized virtual yield".split())
old_fields = {"proxy", "creditsUsed", "balanceCredits", "actualCredits", "reservedCredits", "estimatedCredits", "maxCredits"}


def words(name):
    return re.findall(r"[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|[^a-z]|$)|[0-9]+", name)


def pascal(name):
    parts = "".join(word.capitalize() for word in words(name))
    return parts if parts and not parts[0].isdigit() else "Value" + parts


def snake(name):
    result = "_".join(word.lower() for word in words(name))
    return result + "_" if result in keywords else result


def reference(value):
    return refs[value.rsplit("/", 1)[-1]]


def type_of(name, schema):
    if "$ref" in schema:
        return reference(schema["$ref"])
    branches = schema.get("anyOf", [])
    if branches:
        types = [branch.get("type") for branch in branches]
        if set(types) == {"string", "number", "boolean", "null", "array", "object"}:
            return "Value"
        if "null" in types and len(types) == 2:
            sibling = branches[1 - types.index("null")]
            return f"Option<{type_of(name, sibling)}>"
        variants = []
        for index, branch in enumerate(branches, 1):
            kind = branch.get("const") or branch.get("properties", {}).get("type", {}).get("const")
            variant = pascal(kind) if isinstance(kind, str) else pascal(branch.get("type", "variant"))
            if variant in {key for key, _ in variants}:
                variant += str(index)
            variants.append((variant, type_of(name + variant, branch)))
        definitions[name] = (
            "#[derive(Clone, Deserialize, Serialize)]\n#[serde(untagged)]\n"
            + f"pub enum {name} {{\n"
            + "".join(f"{variant}({kind}),\n" for variant, kind in variants)
            + "}\n"
        )
        return name

    kind = schema.get("type")
    constant = schema.get("const")
    if isinstance(kind, list):
        return type_of(name, {"anyOf": [{**schema, "type": item} for item in kind]})
    values = schema.get("enum", [constant] if isinstance(constant, str) else [])
    if values and all(isinstance(value, str) for value in values):
        variants = []
        seen = set()
        for index, value in enumerate(values, 1):
            variant = pascal(value)
            if variant in seen or variant == "Self":
                variant += str(index)
            seen.add(variant)
            variants.append(f"#[serde(rename = {literal(value)})]\n{variant},\n")
        definitions[name] = (
            f"#[derive(Clone, Deserialize, Serialize)]\npub enum {name} {{\n"
            + "".join(variants)
            + "}\n"
        )
        return name
    if kind == "array":
        return f"Vec<{type_of(name + 'Item', schema.get('items', {}))}>"
    if kind == "object":
        if "properties" in schema:
            return object_type(name, schema)
        extra = schema.get("additionalProperties")
        value = type_of(name + "Value", extra) if isinstance(extra, dict) else "Value"
        return f"BTreeMap<String, {value}>"
    if kind == "boolean" or isinstance(constant, bool):
        return "bool"
    if kind == "integer":
        return "i64"
    if kind == "number":
        return "f64"
    if kind == "string":
        return "String"
    if kind is None or kind == "null":
        return "Value"
    raise ValueError(f"Unsupported schema for {name}: {kind}")


def literal(value):
    return json.dumps(value, ensure_ascii=False)


def object_type(name, schema):
    required = set(schema.get("required", []))
    fields = []
    constructor = []
    for key, field in schema["properties"].items():
        if key in old_fields or (key in {"requestId", "costUsd"} and "success" in schema["properties"]):
            continue
        rust_name = snake(key)
        kind = type_of(name + pascal(key), field)
        attrs = [f"rename = {literal(key)}"] if rust_name != key else []
        optional = key not in required or (name == "GetLimitsResponseData" and key == "concurrency")
        if optional:
            attrs.append('default, skip_serializing_if = "Option::is_none"')
            if not kind.startswith("Option<"):
                kind = f"Option<{kind}>"
        if attrs:
            fields.append("#[serde(" + ", ".join(attrs) + ")]")
        fields.append(f"pub {rust_name}: {kind},")
        constructor.append((rust_name, kind, optional))
    if isinstance(schema.get("additionalProperties"), dict):
        kind = type_of(name + "Extra", schema["additionalProperties"])
        fields.extend(["#[serde(flatten)]", f"pub extra: BTreeMap<String, {kind}>,"])
    default = ", Default" if all("Option<" in field for field in fields if field.startswith("pub ")) else ""
    definitions[name] = (
        f"#[derive(Clone, Deserialize, Serialize{default})]\npub struct {name} {{\n"
        + "\n".join(fields) + "\n}\n"
    )
    if name.endswith("Request") and constructor and not isinstance(schema.get("additionalProperties"), dict):
        parameters = ", ".join(f"{field}: {kind}" for field, kind, optional in constructor if not optional)
        values = "".join(f"{field}: None,\n" if optional else f"{field},\n" for field, _, optional in constructor)
        definitions[name] += f"impl {name} {{\npub fn new({parameters}) -> Self {{\nSelf {{\n{values}}}\n}}\n}}\n"
    return name


components = spec["components"]
refs = {key: pascal(key) + "Schema" for key in components["schemas"]}
for key, schema in components["schemas"].items():
    name = refs[key]
    if key == "Error":
        continue
    result = type_of(name, schema)
    if result != name:
        definitions[name] = f"pub type {name} = {result};\n"


def json_schema(entry):
    return entry.get("content", {}).get("application/json", {}).get("schema", {})


for path, operations in spec["paths"].items():
    for verb, endpoint in operations.items():
        op = endpoint["operationId"]
        name = pascal(op)
        params = [components["parameters"][p["$ref"].rsplit("/", 1)[-1]] if "$ref" in p else p
                  for p in endpoint.get("parameters", [])]
        positional = [p["name"] for p in params if p["in"] == "path"]
        query_fields = [p for p in params if p["in"] == "query" and p["name"] != "maxTextLength"]
        signature = ["&self", *(f"{snake(key)}: &str" for key in positional)]
        pairs = ", ".join(f"({literal(key)}, {snake(key)})" for key in positional)
        query = '&[] as &[(&str, &str)]'
        if query_fields:
            query_type = object_type(name + "Query", {
                "properties": {p["name"]: p["schema"] for p in query_fields},
                "required": [p["name"] for p in query_fields if p.get("required")],
            })
            signature.append(f"query: &{query_type}")
            query = "query"
        request_type = type_of(name + "Request", json_schema(endpoint["requestBody"])) if "requestBody" in endpoint else None
        if request_type == name + "Request" and not json_schema(endpoint["requestBody"]).get("properties"):
            definitions.pop(request_type)
            body = "Some(&BTreeMap::<String, Value>::new())"
        elif request_type:
            signature.append(f"body: &{request_type}")
            body = "Some(body)"
        else:
            body = "None::<&Value>"
        success = {code: json_schema(r) for code, r in endpoint["responses"].items() if code.startswith("2")}
        unique = list({json.dumps(schema, sort_keys=True): schema for schema in success.values()}.values())
        response = type_of(name + "Response", unique[0] if len(unique) == 1 else {"anyOf": unique})
        signature.append("options: &RequestOptions")
        methods.append(
            f"pub async fn {snake(op)}({', '.join(signature)}) -> Result<Response<{response}>, Error> {{\n"
            f"self.request(Method::{verb.upper()}, self.path({literal(path)}, &[{pairs}])?, {body}, {query}, options).await\n}}\n"
        )

output = "use std::collections::BTreeMap;\nuse reqwest::Method;\nuse serde::{Deserialize, Serialize};\nuse serde_json::Value;\nuse crate::{Client, Error, RequestOptions, Response};\n\n"
output += "\n".join(definitions.values()) + "\nimpl Client {\n" + "\n".join(methods) + "}\n"
formatted = subprocess.run(["rustfmt", "--edition", "2024", "--emit", "stdout"], input=output, text=True, capture_output=True, check=True).stdout
parser = argparse.ArgumentParser()
parser.add_argument("--check", action="store_true")
target = crate / "src/generated.rs"
if parser.parse_args().check:
    if target.read_text() != formatted:
        raise SystemExit("Run python3 crates/stophy/generate.py to regenerate the SDK.")
else:
    target.write_text(formatted)
