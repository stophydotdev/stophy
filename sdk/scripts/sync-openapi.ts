import {
  isRecord,
  isString,
  type JsonObject,
  type JsonValue,
} from "../packages/typescript/src/json";

const url = process.env.STOPHY_OPENAPI_URL ?? "https://api.stophy.dev/openapi.json";
const target = new URL("../openapi.json", import.meta.url);

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Failed to download OpenAPI spec from ${url}: ${response.status}`);
}

const document: JsonValue = await response.json();
if (!isRecord(document) || !Object.hasOwn(document, "openapi") || !isRecord(document.paths)) {
  throw new Error(`Response from ${url} is not an OpenAPI document.`);
}

const hoisted = hoistLocalDefs(document.paths);
if (Object.keys(hoisted).length > 0) {
  const components = isRecord(document.components) ? document.components : {};
  const schemas = isRecord(components.schemas) ? components.schemas : {};
  document.components = { ...components, schemas: { ...schemas, ...hoisted } };
}

const text = `${JSON.stringify(document, null, 2)}\n`;
await Bun.write(target, text);
console.log(`Wrote ${target.pathname} from ${url} (${text.length} bytes).`);

const parsersUrl = new URL("/v1/parsers", url);
const parsersTarget = new URL("../parsers.json", import.meta.url);
const parsers = await parserNames(parsersUrl);
await Bun.write(parsersTarget, `${JSON.stringify(parsers, null, 2)}\n`);
console.log(`Wrote ${parsers.length} parser names to ${parsersTarget.pathname}.`);

async function parserNames(from: URL): Promise<string[]> {
  const reply = await fetch(from);
  if (!reply.ok) throw new Error(`Failed to download parsers from ${from}: ${reply.status}`);
  const body: JsonValue = await reply.json();
  const list = isRecord(body) && isRecord(body.data) ? body.data.parsers : undefined;
  if (!Array.isArray(list)) throw new Error(`Response from ${from} has no parsers.`);
  return list
    .flatMap((parser) => (isRecord(parser) && isString(parser.name) ? [parser.name] : []))
    .toSorted();
}

function hoistLocalDefs(paths: JsonObject): JsonObject {
  const hoisted: JsonObject = {};
  for (const item of Object.values(paths)) {
    if (!isRecord(item)) continue;
    for (const operation of Object.values(item)) {
      if (!isRecord(operation) || !isString(operation.operationId)) continue;
      const prefix = pascal(operation.operationId);
      for (const [key, value] of Object.entries(operation)) {
        operation[key] = rewrite(value, new Map(), prefix, hoisted);
      }
    }
  }
  return hoisted;
}

function rewrite(
  value: JsonValue,
  names: ReadonlyMap<string, string>,
  prefix: string,
  hoisted: JsonObject,
): JsonValue {
  if (Array.isArray(value)) return value.map((item) => rewrite(item, names, prefix, hoisted));
  if (!isRecord(value)) return value;
  const { $defs: defs, ...rest } = value;
  const scope = new Map(names);
  if (isRecord(defs)) {
    for (const name of Object.keys(defs)) scope.set(name, `${prefix}${pascal(name)}`);
    for (const [name, def] of Object.entries(defs)) {
      const component = scope.get(name);
      if (component === undefined) continue;
      if (Object.hasOwn(hoisted, component)) throw new Error(`Two schemas hoist to ${component}.`);
      hoisted[component] = rewrite(def, scope, prefix, hoisted);
    }
  }
  const out: JsonObject = {};
  for (const [key, child] of Object.entries(rest)) {
    out[key] =
      key === "$ref" && isString(child)
        ? localRef(child, scope)
        : rewrite(child, scope, prefix, hoisted);
  }
  return out;
}

function localRef(ref: string, names: ReadonlyMap<string, string>): string {
  if (!ref.startsWith("#/$defs/")) return ref;
  const component = names.get(ref.slice("#/$defs/".length));
  if (component === undefined) throw new Error(`Cannot resolve ${ref}.`);
  return `#/components/schemas/${component}`;
}

function pascal(value: string): string {
  return value
    .split(/[^A-Za-z0-9]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
