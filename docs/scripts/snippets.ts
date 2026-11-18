import { readFileSync } from "node:fs";
import { type Json, type JsonObject, isBoolean, isNumber, isObject, isString } from "./catalog";
import type { Recorded } from "./reference";

const API = "https://api.stophy.dev";

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

function literal(value: Json, indent: string, python: boolean): string {
  if (value === null) return python ? "None" : "null";
  if (isBoolean(value)) return python ? (value ? "True" : "False") : String(value);
  if (isString(value) || isNumber(value)) return JSON.stringify(value);
  const inner = `${indent}    `.slice(0, indent.length + (python ? 4 : 2));
  const wrap = (open: string, items: string[], close: string) =>
    items.join(", ").length < 60
      ? `${open}${python || open === "[" ? "" : " "}${items.join(", ")}${python || open === "[" ? "" : " "}${close}`
      : `${open}\n${items.map((item) => `${inner}${item},`).join("\n")}\n${indent}${close}`;
  if (Array.isArray(value)) return wrap("[", value.map((item) => literal(item, inner, python)), "]");
  const key = (name: string) => (python || !IDENTIFIER.test(name) ? JSON.stringify(name) : name);
  return wrap("{", Object.entries(value).map(([name, item]) => `${key(name)}: ${literal(item, inner, python)}`), "}");
}


export function curlSnippet(call: Recorded["request"], keyed: boolean): string {
  const lines = [`curl${call.method === "GET" ? "" : ` -X ${call.method}`} ${API}${call.path}`];
  if (keyed) lines.push('-H "Authorization: Bearer $STOPHY_API_KEY"');
  if (call.body !== undefined) {
    lines.push('-H "Content-Type: application/json"', `-d '${JSON.stringify(call.body).replaceAll("'", "'\\''")}'`);
  }
  return ['```bash cURL', lines.join(" \\\n  "), "```"].join("\n");
}

function fetchSnippet(call: Recorded["request"], keyed: boolean): string {
  const headers = [
    ...(keyed ? ["Authorization: `Bearer ${process.env.STOPHY_API_KEY}`,"] : []),
    ...(call.body === undefined ? [] : ['"Content-Type": "application/json",']),
  ];
  const options = [
    ...(call.method === "GET" ? [] : [`method: "${call.method}",`]),
    ...(headers.length === 0 ? [] : ["headers: {", ...headers.map((line) => `  ${line}`), "},"]),
    ...(call.body === undefined ? [] : [`body: JSON.stringify(${literal(call.body, "  ", false)}),`]),
  ];
  const fetchCall =
    options.length === 0
      ? `const response = await fetch("${API}${call.path}");`
      : [`const response = await fetch("${API}${call.path}", {`, ...options.map((line) => `  ${line}`), "});"].join("\n");
  return ["```typescript TypeScript", fetchCall, "console.log(await response.json());", "```"].join("\n");
}

function requestsSnippet(call: Recorded["request"], keyed: boolean): string {
  const args = [
    `"${API}${call.path}",`,
    ...(keyed ? ['headers={"Authorization": f"Bearer {os.environ[\'STOPHY_API_KEY\']}"},'] : []),
    ...(call.body === undefined ? [] : [`json=${literal(call.body, "    ", true)},`]),
  ];
  return [
    "```python Python",
    ...(keyed ? ["import os", ""] : []),
    "import requests",
    "",
    `response = requests.${call.method.toLowerCase()}(`,
    ...args.map((line) => `    ${line}`),
    ")",
    "print(response.json())",
    "```",
  ].join("\n");
}

interface SdkRoute {
  method: string;
  path: RegExp;
  name: string;
  id?: true;
  query: readonly string[];
}

const SDK_CALLS: readonly SdkRoute[] = [
  { method: "GET", path: /^\/v1\/endpoints$/, name: "endpoints", query: [] },
  { method: "GET", path: /^\/v1\/parsers$/, name: "parsers", query: [] },
  { method: "POST", path: /^\/v1\/scrape$/, name: "scrape", query: [] },
  { method: "POST", path: /^\/v1\/search$/, name: "search", query: [] },
  { method: "POST", path: /^\/v1\/map$/, name: "map", query: [] },
  { method: "POST", path: /^\/v1\/parse$/, name: "parse", query: [] },
  { method: "POST", path: /^\/v1\/crawl$/, name: "crawl", query: [] },
  { method: "GET", path: /^\/v1\/crawl\/([^/?]+)$/, name: "crawl.status", id: true, query: ["cursor", "maxTextLength"] },
  { method: "DELETE", path: /^\/v1\/crawl\/([^/?]+)$/, name: "crawl.cancel", id: true, query: [] },
  { method: "POST", path: /^\/v1\/batch\/scrape$/, name: "batch.scrape", query: [] },
  { method: "GET", path: /^\/v1\/batch\/scrape\/([^/?]+)$/, name: "batch.scrape.status", id: true, query: ["cursor", "maxTextLength"] },
  { method: "DELETE", path: /^\/v1\/batch\/scrape\/([^/?]+)$/, name: "batch.scrape.cancel", id: true, query: [] },
  { method: "POST", path: /^\/v1\/extract$/, name: "extract", query: [] },
  { method: "GET", path: /^\/v1\/extract\/([^/?]+)$/, name: "extract.result", id: true, query: [] },
  { method: "POST", path: /^\/v1\/signup$/, name: "signup", query: [] },
  { method: "POST", path: /^\/v1\/signup\/poll$/, name: "signup.poll", query: [] },
  { method: "GET", path: /^\/v1\/limits$/, name: "limits", query: [] },
  { method: "GET", path: /^\/v1\/usage$/, name: "usage", query: [] },
  { method: "GET", path: /^\/v1\/logs$/, name: "logs", query: ["days", "page", "apiKeyId", "endpoint"] },
  { method: "DELETE", path: /^\/v1\/key$/, name: "key.revoke", query: [] },
  { method: "POST", path: /^\/v1\/browser\/task$/, name: "browser.task", query: [] },
  { method: "POST", path: /^\/v1\/browser\/task\/status$/, name: "browser.task.status", query: [] },
];

const NUMBER_QUERY = new Set(["days", "page", "maxTextLength"]);

const parserNames = new Set(readFileSync(new URL("../../sdk/packages/typescript/src/generated/parsers.gen.ts", import.meta.url), "utf8").match(/"[a-z0-9-]+"/g)?.map((name) => name.slice(1, -1)));

interface SdkCall {
  name: string;
  args: JsonObject;
}

function sdkCall(call: Recorded["request"]): SdkCall | undefined {
  const [path = "", search] = call.path.split("?");
  const route = SDK_CALLS.find((entry) => entry.method === call.method && entry.path.test(path));
  if (route === undefined) return undefined;
  const query = Object.fromEntries(new URLSearchParams(search));
  if (Object.keys(query).some((name) => !route.query.includes(name))) return undefined;
  const id = route.id ? { id: route.path.exec(path)?.[1] ?? "" } : {};
  const typed = Object.fromEntries(Object.entries(query).map(([name, value]) => [name, NUMBER_QUERY.has(name) ? Number(value) : value]));
  return { name: route.name, args: { ...id, ...typed, ...call.body } };
}

interface ParserCall {
  parser: string;
  url: string;
  options: JsonObject | undefined;
}

function parserCall({ name, args }: SdkCall): ParserCall | undefined {
  const { url, formats, ...others } = args;
  if (name !== "scrape" || !isString(url) || !Array.isArray(formats) || Object.keys(others).length > 0 || formats.length !== 1) return undefined;
  const [format] = formats;
  if (!isObject(format) || format.type !== "json" || !isString(format.parser) || !parserNames.has(format.parser)) return undefined;
  const { options } = format;
  if (Object.keys(format).some((name) => !["type", "parser", "options"].includes(name)) || (options !== undefined && !isObject(options))) return undefined;
  return { parser: format.parser, url, options };
}

const snake = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();

const objectArg = (args: JsonObject) => (Object.keys(args).length === 0 ? "" : literal(args, "", false));

function tsSdkSnippet(call: SdkCall): string {
  const parsed = parserCall(call);
  const invocation = parsed
    ? [JSON.stringify(parsed.parser), JSON.stringify(parsed.url), ...(parsed.options === undefined ? [] : [literal(parsed.options, "", false)])]
    : [objectArg(call.args)];
  const method = parsed ? "parsed" : call.name;
  const args = invocation.join(", ");
  const wrapped = args.length > 60 && !args.startsWith("{") ? `\n  ${invocation.join(",\n  ")},\n` : args;
  return [
    "```typescript TypeScript",
    'import { Stophy } from "stophy";',
    "",
    "const stophy = new Stophy();",
    "",
    `const result = await stophy.${method}(${wrapped});`,
    "console.log(result);",
    "```",
  ].join("\n");
}

function pythonSdkSnippet(call: SdkCall): string {
  const parsed = parserCall(call);
  const entries = parsed
    ? [JSON.stringify(parsed.parser), JSON.stringify(parsed.url), ...Object.entries(parsed.options ?? {}).map(([name, value]) => `${snake(name)}=${literal(value, "    ", true)}`)]
    : Object.entries(call.args).map(([name, value]) => `${snake(name)}=${literal(value, "    ", true)}`);
  const method = parsed ? "parsed" : call.name;
  const inline = `stophy.${method}(${entries.join(", ")})`;
  const invocation = entries.length === 0 || (inline.length < 72 && !inline.includes("\n")) ? inline : [`stophy.${method}(`, ...entries.map((entry) => `    ${entry},`), ")"].join("\n");
  return ["```python Python", "from stophy import Stophy", "", "stophy = Stophy()", "", `result = ${invocation}`, "print(result)", "```"].join("\n");
}

export function tsSnippet(call: Recorded["request"], keyed: boolean): string {
  const sdk = sdkCall(call);
  return sdk === undefined ? fetchSnippet(call, keyed) : tsSdkSnippet(sdk);
}

export function pythonSnippet(call: Recorded["request"], keyed: boolean): string {
  const sdk = sdkCall(call);
  return sdk === undefined ? requestsSnippet(call, keyed) : pythonSdkSnippet(sdk);
}
