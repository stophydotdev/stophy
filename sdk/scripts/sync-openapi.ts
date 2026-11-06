import { isRecord, isString, type JsonValue } from "../packages/typescript/src/json";

const url = process.env.STOPHY_OPENAPI_URL ?? "https://api.stophy.dev/openapi.json";
const target = new URL("../openapi.json", import.meta.url);

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Failed to download OpenAPI spec from ${url}: ${response.status}`);
}

const document: JsonValue = await response.json();
if (
  !isRecord(document) ||
  !Object.hasOwn(document, "openapi") ||
  !Object.hasOwn(document, "paths")
) {
  throw new Error(`Response from ${url} is not an OpenAPI document.`);
}

const text = `${JSON.stringify(withoutUnsendableFields(document), null, 2)}\n`;
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

function withoutUnsendableFields(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(withoutUnsendableFields);
  if (!isRecord(value)) return value;
  const entries = Object.entries(value).map(([key, child]) => {
    if (key !== "properties" || !isRecord(child)) return [key, withoutUnsendableFields(child)];
    const sendable = Object.entries(child).filter(([, field]) => !acceptsNothing(field));
    return [
      key,
      Object.fromEntries(sendable.map(([name, field]) => [name, withoutUnsendableFields(field)])),
    ];
  });
  return Object.fromEntries(entries);
}

function acceptsNothing(schema: JsonValue): boolean {
  if (!isRecord(schema)) return false;
  const keys = Object.keys(schema);
  const isNever = keys.length === 1 && isRecord(schema.not) && Object.keys(schema.not).length === 0;
  return isNever || (schema.type === "array" && schema.maxItems === 0);
}
