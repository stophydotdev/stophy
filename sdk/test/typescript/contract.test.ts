import { expect, test } from "bun:test";
import { isRecord, type JsonValue } from "../../packages/typescript/src/json";
import { sdkDocument } from "../../scripts/sync-openapi";

const annotations = new Set([
  "description",
  "summary",
  "title",
  "example",
  "examples",
  "externalDocs",
  "$comment",
]);
const namedMaps = new Set(["properties", "patternProperties", "$defs", "headers", "content"]);
const literals = new Set(["const", "default", "enum"]);

function withoutAnnotations(value: JsonValue, parent = ""): JsonValue {
  if (Array.isArray(value)) return value.map((child) => withoutAnnotations(child));
  if (!isRecord(value)) return value;
  const named = namedMaps.has(parent);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => named || !annotations.has(key))
      .map(([key, child]) => [
        key,
        !named && literals.has(key) ? child : withoutAnnotations(child, named ? "" : key),
      ]),
  );
}

function contractParts(document: JsonValue): Map<string, JsonValue> {
  if (!isRecord(document) || !isRecord(document.paths) || !isRecord(document.components)) {
    throw new Error("OpenAPI document is missing paths or components.");
  }
  const parts = new Map<string, JsonValue>();
  for (const [path, item] of Object.entries(document.paths)) {
    if (!isRecord(item)) throw new Error(`Invalid path: ${path}`);
    for (const [method, operation] of Object.entries(item)) {
      if (!isRecord(operation)) throw new Error(`Invalid operation: ${method} ${path}`);
      const { operationId, parameters, requestBody, responses } = operation;
      parts.set(
        `${method.toUpperCase()} ${path}`,
        withoutAnnotations({
          operationId: operationId ?? null,
          parameters: parameters ?? [],
          requestBody: requestBody ?? null,
          responses: responses ?? null,
        }),
      );
    }
  }
  for (const [kind, group] of Object.entries(document.components)) {
    if (!isRecord(group)) throw new Error(`Invalid component group: ${kind}`);
    for (const [name, component] of Object.entries(group)) {
      parts.set(`#/components/${kind}/${name}`, withoutAnnotations(component));
    }
  }
  return parts;
}

test("supported requests and responses match the published OpenAPI snapshot", async () => {
  const published: JsonValue = await Bun.file(
    new URL("../../../docs/api-reference/openapi.json", import.meta.url),
  ).json();
  const saved: JsonValue = await Bun.file(new URL("../../openapi.json", import.meta.url)).json();
  const expected = contractParts(sdkDocument(published));
  const actual = contractParts(saved);
  const drift = [...new Set([...expected.keys(), ...actual.keys()])].filter(
    (key) => !Bun.deepEquals(actual.get(key), expected.get(key)),
  );
  expect(drift).toEqual([]);
});
