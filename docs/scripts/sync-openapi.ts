import { type Json, isObject, isString, jsonObject } from "./catalog";
import { pathDrift } from "./spec";

const source = process.env.STOPHY_OPENAPI_URL ?? "https://api.stophy.dev/openapi.json";
const target = new URL("../api-reference/openapi.json", import.meta.url);

const KEYLESS_SENTENCE = / ?Works without an API key, within free limits\./g;

const keyedOnly = (security: Json | undefined): Json | undefined =>
  Array.isArray(security)
    ? security.filter((entry) => !(isObject(entry) && Object.keys(entry).length === 0))
    : security;

const response = await fetch(source);
if (!response.ok) throw new Error(`GET ${source} returned ${response.status}`);
const spec = jsonObject.parse(await response.json());

const info = spec.info;
if (isObject(info) && isString(info.description)) {
  info.description = info.description
    .split("\n\n")
    .filter((paragraph) => !paragraph.includes("without an API key"))
    .join("\n\n");
}

const paths = isObject(spec.paths) ? spec.paths : {};
for (const item of Object.values(paths)) {
  if (!isObject(item)) continue;
  for (const operation of Object.values(item)) {
    if (!isObject(operation)) continue;
    if (isString(operation.description)) {
      operation.description = operation.description.replace(KEYLESS_SENTENCE, "");
    }
    if (isString(operation.summary)) {
      operation.summary = operation.summary.replace(KEYLESS_SENTENCE, "");
    }
    const security = keyedOnly(operation.security);
    if (security !== undefined) operation.security = security;
  }
}

if (process.argv.includes("--check")) {
  const saved = jsonObject.parse(await Bun.file(target).json()).paths;
  const drift = pathDrift(Object.keys(paths), isObject(saved) ? Object.keys(saved) : []);
  for (const path of drift.missing) console.error(`api-reference/openapi.json is missing ${path}`);
  for (const path of drift.extra) console.error(`api-reference/openapi.json has ${path}, which the live API no longer has`);
  if (drift.missing.length + drift.extra.length > 0) {
    console.error("Run bun scripts/sync-openapi.ts in docs/ and commit the result.");
    process.exit(1);
  }
  console.log(`api-reference/openapi.json has every path in ${source}`);
} else {
  await Bun.write(target, `${JSON.stringify(spec, null, 2)}\n`);
  console.log(`Wrote ${target.pathname} from ${source}`);
}
