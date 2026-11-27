import { type Json, type JsonObject, isObject, isString, jsonObject } from "./catalog";
import { z } from "zod";
import { type Recorded, anonymize, hideSearchLinks, referenceConfig, shorten } from "./reference";

const API = process.env.STOPHY_API_URL ?? "https://api.stophy.dev";
const key = process.env.STOPHY_API_KEY;
if (key === undefined || key === "") throw new Error("Set STOPHY_API_KEY to record the example calls.");

const root = new URL("..", import.meta.url);
const file = (path: string) => new URL(path, root);
const config = referenceConfig.parse(await Bun.file(file("scripts/reference.config.json")).json());
const spec = jsonObject.parse(await Bun.file(file("api-reference/openapi.json")).json());

const masked = (value: Json, mask: JsonObject, path = ""): Json => {
  if (Array.isArray(value)) return value.map((item) => masked(item, mask, `${path}.*`));
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([field, item]) => {
      const here = path === "" ? field : `${path}.${field}`;
      return [field, mask[here] ?? mask[field] ?? masked(item, mask, here)];
    }),
  );
};

interface Call {
  method: string;
  path: string;
  body?: JsonObject;
}

const send = async ({ method, path, body }: Call) => {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  return { status: response.status, body: text === "" ? {} : jsonObject.parse(JSON.parse(text)) };
};

const filled = (template: string, values: JsonObject) =>
  template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = values[name];
    if (!isString(value)) throw new Error(`No ${name} for ${template}`);
    return value;
  });

const operations = new Map<string, { method: string; path: string; example: JsonObject | undefined }>();
for (const [path, item] of Object.entries(isObject(spec.paths) ? spec.paths : {})) {
  for (const [method, op] of Object.entries(isObject(item) ? item : {})) {
    if (!isObject(op) || !isString(op.operationId)) continue;
    const json = isObject(op.requestBody) ? jsonObject.safeParse(op.requestBody).data : undefined;
    const content = isObject(json?.content) ? json.content["application/json"] : undefined;
    const example = isObject(content) && isObject(content.example) && Object.keys(content.example).length > 0 ? content.example : undefined;
    operations.set(op.operationId, { method: method.toUpperCase(), path, example });
  }
}

const parsersList = z.object({ "x-stophy-catalog": z.object({ parsers: z.array(z.object({ name: z.string(), example: z.string() })) }) });

const found: JsonObject = process.env.STOPHY_FOUND === undefined ? {} : jsonObject.parse(JSON.parse(process.env.STOPHY_FOUND));
const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));
const finished = (body: JsonObject) => {
  const data = isObject(body.data) ? body.data : body;
  return !["scraping", "running", "processing", "pending", "waiting"].includes(String(data.status));
};

const walk = (value: Json | undefined, path: string): Json | undefined =>
  path.split(".").reduce<Json | undefined>((node, step) => {
    if (Array.isArray(node)) return node[Number(step)];
    return isObject(node) ? node[step] : undefined;
  }, value);

const keepFrom = (body: JsonObject, keep: Record<string, string>) => {
  for (const [name, path] of Object.entries(keep)) {
    const value = walk(body, path) ?? walk(body.data, path);
    if (value !== undefined) found[name] = value;
  }
};

const callFor = (id: string, body: JsonObject | undefined, use: Record<string, string> = {}, query: Record<string, string> = {}): Call => {
  const op = operations.get(id);
  if (op === undefined) throw new Error(`${id} is not in api-reference/openapi.json`);
  const values = Object.fromEntries(Object.entries(use).map(([field, name]) => [field, found[name] ?? null]));
  const inPath = (field: string) => op.path.includes(`{${field}}`);
  const extra = Object.fromEntries(Object.entries(values).filter(([field]) => !inPath(field)));
  const hasBody = op.method !== "GET" && op.method !== "DELETE";
  const params = new URLSearchParams(query);
  if (!hasBody) for (const [field, value] of Object.entries(extra)) params.set(field, String(value));
  const path = `${filled(op.path, values)}${params.size === 0 ? "" : `?${params}`}`;
  const sent = !hasBody || (body === undefined && Object.keys(extra).length === 0) ? undefined : { ...body, ...extra };
  return { method: op.method, path, body: sent };
};

async function record(id: string) {
  const plan = config.calls[id] ?? {};
  if (plan.before !== undefined) {
    keepFrom((await send(callFor(plan.before.operation, plan.before.body))).body, plan.before.keep);
  }
  const call = callFor(id, plan.body ?? operations.get(id)?.example, plan.use, plan.query);
  let answer = await send(call);
  for (let tries = 0; plan.until === "finished" && !finished(answer.body) && tries < 60; tries += 1) {
    await sleep(3000);
    answer = await send(call);
  }
  keepFrom(answer.body, plan.keep ?? {});
  const request = { ...call, body: call.body === undefined ? undefined : jsonObject.parse(shorten(masked(call.body, config.masks[id] ?? {}))) };
  const shown = jsonObject.parse(shorten(masked(answer.body, config.masks[id] ?? {})));
  const response = anonymize(id.startsWith("search") ? jsonObject.parse(hideSearchLinks(shown)) : shown);
  const recorded: Recorded = { request, status: answer.status, response };
  await Bun.write(file(`scripts/responses/${id}.json`), `${JSON.stringify(recorded, null, 2)}\n`);
  console.log(`${id}: ${answer.status}`);
}

async function recordParser(name: string) {
  const listed = parsersList.parse(await (await fetch(`${API}/openapi.json`)).json());
  const entry = listed["x-stophy-catalog"].parsers.find((parser) => parser.name === name);
  if (entry === undefined) throw new Error(`${name} is not in the parser catalog in /openapi.json`);
  const call: Call = { method: "POST", path: "/v1/scrape", body: { url: entry.example, formats: [{ type: "json", parser: name }] } };
  const answer = await send(call);
  const recorded: Recorded = { request: call, status: answer.status, response: anonymize(jsonObject.parse(shorten(answer.body))) };
  await Bun.write(file(`scripts/responses/parsers/${name}.json`), `${JSON.stringify(recorded, null, 2)}\n`);
  console.log(`parser ${name}: ${answer.status}`);
}

const only = process.argv.slice(2);
for (const name of only.filter((id) => id.startsWith("parser:"))) await recordParser(name.slice("parser:".length));
const wanted = only.filter((id) => !id.startsWith("parser:"));
if (only.length > 0 && wanted.length === 0) process.exit(0);
for (const id of config.groups.flatMap((group) => group.operations)) {
  if (config.notCalled[id] !== undefined || (wanted.length > 0 && !wanted.includes(id))) continue;
  await record(id).catch((error: Error) => console.error(`${id}: ${error.message}`));
}
