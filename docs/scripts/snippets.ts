import { type Json, isBoolean, isNumber, isString } from "./catalog";
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

export function tsSnippet(call: Recorded["request"], keyed: boolean): string {
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

export function pythonSnippet(call: Recorded["request"], keyed: boolean): string {
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
