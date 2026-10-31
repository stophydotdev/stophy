import { isRecord, type JsonValue } from "../packages/typescript/src/json";

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

const text = `${JSON.stringify(document, null, 2)}\n`;
await Bun.write(target, text);
console.log(`Wrote ${target.pathname} from ${url} (${text.length} bytes).`);
