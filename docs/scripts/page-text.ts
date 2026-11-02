import { z } from "zod";
import {
  type CatalogEndpoint,
  type Json,
  type JsonObject,
  isNumber,
  isObject,
  dollars,
  inDollars,
  isString,
  jsonObject,
  namesAt,
  schemaProperties,
} from "./catalog";

const wording = z.record(z.string(), z.string());

export const textConfig = z.object({
  notes: wording,
  holds: wording,
  bestWhenNotes: wording,
  requests: wording,
  cursorHours: z.record(z.string(), z.number()),
  pagingNotes: wording,
  fields: wording,
  fieldsFor: z.record(z.string(), wording),
  optionText: wording,
  optionRewrites: wording,
  optionValues: wording,
  next: z.record(
    z.string(),
    z.array(z.union([z.string().transform((id) => [id, undefined] as const), z.tuple([z.string(), z.string()])])),
  ),
});

export type TextConfig = z.infer<typeof textConfig>;

export const exampleResponse = z.object({
  live: z.boolean(),
  creditsUsed: z.number(),
  data: jsonObject,
});

export type ExampleResponse = z.infer<typeof exampleResponse>;

export interface PageInput {
  endpoint: CatalogEndpoint;
  catalog: CatalogEndpoint[];
  config: TextConfig;
  schema: JsonObject | undefined;
  creditsMax: number | undefined;
  response: ExampleResponse;
  slug: (id: string) => string;
  label: (id: string) => string;
  titleOf: (id: string) => string;
}

export const problems: string[] = [];

const REQUEST_ID = "2fe9dbad-fc48-4890-9751-0b24b596035b";
const MAX_ENUM_SHOWN = 10;
const MAX_FIELD_NOTES = 6;
const MAX_NEXT = 4;

const code = (text: string) => `\`${text}\``;
const list = (items: string[], last: string) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${last} ${items.at(-1)}`;
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
const sentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);
const required = (op: CatalogEndpoint) => namesAt(op.input, "required");
const sendOne = (op: CatalogEndpoint) => namesAt(op.input, "sendOne");

function linkIds(text: string, input: PageInput): string {
  const ids = input.catalog.map((item) => item.id).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(?<![\\w.\\[])(${ids.map((id) => id.replaceAll(".", "\\.")).join("|")})(?![\\w])`, "g");
  return text.replace(pattern, (id) => `[${input.label(id)}](/api-reference/endpoint/${input.slug(id)})`);
}

function whenToUse(op: CatalogEndpoint): string {
  const one = sendOne(op);
  if (one.length === 0) return "";
  const kinds = new Map(Object.entries({ Url: "URL", Id: "ID", Code: "code" }));
  const things: string[] = [];
  const forms: string[] = [];
  for (const field of one) {
    const suffix = field.match(/(Url|Id|Code)$/)?.[1];
    const thing = suffix === undefined ? field.replace(/name$/, "") : field.slice(0, -suffix.length);
    if (!things.includes(thing)) things.push(thing);
    const form = suffix === undefined ? field : (kinds.get(suffix) ?? field);
    if (!forms.includes(form)) forms.push(form);
  }
  if (things.join() === forms.join()) return "";
  return `Pick the ${list(things, "or")} by its ${list(forms, "or")}.`;
}

function bestWhenNotes(op: CatalogEndpoint, config: TextConfig): string[] {
  const reworded = config.bestWhenNotes[op.id];
  if (reworded !== undefined) return reworded === "" ? [] : [reworded];
  const sentences = (op.bestWhen ?? "").split(/(?<=\.)\s/).filter(Boolean);
  const advice = /^(Best for|Best when|When )/.test(sentences[0] ?? "");
  const rest = advice ? sentences.slice(1) : sentences;
  return rest.filter((text) => !text.startsWith("Costs "));
}

function requestLine(op: CatalogEndpoint, config: TextConfig): string {
  const override = config.requests[op.id];
  if (override !== undefined) return override;
  const one = sendOne(op);
  const others = required(op).filter((name) => !one.includes(name));
  const send =
    others.length === 0 ? undefined : `Send ${list(others.map(code), "and")}.`;
  const choose =
    one.length === 0
      ? undefined
      : `Send exactly one of ${list(one.map(code), "or")}. ${one.length === 2 ? "Both" : "More than one"}, or none, fails with ${code("invalidRequest")}.`;
  if (send === undefined && choose === undefined) return "Every field is optional.";
  return [send, choose].filter((line) => line !== undefined).join(" ");
}

function showJson(value: Json, indent = ""): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.every((item) => !isObject(item) && !Array.isArray(item))) return `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
    const inner = `${indent}  `;
    return `[\n${value.map((item) => `${inner}${showJson(item, inner)}`).join(",\n")}\n${indent}]`;
  }
  if (isObject(value)) {
    const inner = `${indent}  `;
    const entries = Object.entries(value).map(([key, item]) => `${inner}${JSON.stringify(key)}: ${showJson(item, inner)}`);
    return entries.length === 0 ? "{}" : `{\n${entries.join(",\n")}\n${indent}}`;
  }
  return JSON.stringify(value);
}

function* walk(schema: Json | undefined): Generator<[string, JsonObject]> {
  if (!isObject(schema)) return;
  for (const [name, child] of Object.entries(schemaProperties(schema))) {
    if (isObject(child)) yield [name, child];
    yield* walk(child);
    if (isObject(child)) yield* walk(child.items);
  }
  for (const key of ["items", "oneOf", "anyOf", "allOf"]) {
    const value = schema[key];
    for (const part of Array.isArray(value) ? value : [value]) yield* walk(part);
  }
}

function schemaNotes(schema: JsonObject | undefined) {
  const notes: Record<string, string> = {};
  for (const [name, child] of walk(schema)) {
    if (isString(child.description) && notes[name] === undefined) notes[name] = child.description;
  }
  return notes;
}

const FIRST_FIELDS = ["cursor", "repliesCursor", "type"];

function rowKinds(schema: JsonObject | undefined): string[] {
  const kinds: string[] = [];
  for (const [name, child] of walk(schema)) {
    if (name !== "type") continue;
    const values = child.const !== undefined ? [child.const] : Array.isArray(child.enum) ? child.enum : [];
    for (const value of values) if (isString(value) && !kinds.includes(value)) kinds.push(value);
  }
  return kinds;
}

function fieldNames(schema: JsonObject | undefined): Set<string> {
  return new Set([...walk(schema)].map(([name]) => name));
}

function shownNames(data: JsonObject): string[] {
  const names: string[] = [];
  const add = (value: JsonObject) => names.push(...Object.keys(value).filter((name) => !names.includes(name)));
  add(data);
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) for (const row of value) if (isObject(row)) add(row);
    if (isObject(value)) add(value);
  }
  return names;
}

function fieldNotes(input: PageInput): [string, string][] {
  const { endpoint, config, response } = input;
  const own = config.fieldsFor[endpoint.id] ?? {};
  const fromSchema = schemaNotes(input.schema);
  const shown = new Set(shownNames(response.data));
  const important = [...FIRST_FIELDS, ...Object.keys(own), ...Object.keys(config.fields)];
  const kinds = rowKinds(input.schema);
  const picked: [string, string][] = [];
  for (const name of important) {
    if (picked.length === MAX_FIELD_NOTES) break;
    if (!shown.has(name) || picked.some(([done]) => done === name)) continue;
    const kindNote = name === "type" && kinds.length > 0 ? `The kind of item: ${list(kinds.map(code), "or")}.` : undefined;
    const note = (own[name] === "" ? fromSchema[name] : own[name]) ?? kindNote ?? fromSchema[name] ?? config.fields[name];
    if (note !== undefined) picked.push([name, backtickNames(note)]);
  }
  return picked;
}

function typeOf(schema: JsonObject | undefined, name: string, depth = 0): string | undefined {
  if (schema === undefined || depth > 8) return undefined;
  const props = isObject(schema.properties) ? schema.properties : undefined;
  if (props !== undefined) {
    const found = props[name];
    if (isObject(found)) return typeLabel(found);
    for (const child of Object.values(props)) {
      const inner = isObject(child) ? typeOf(child, name, depth + 1) : undefined;
      if (inner !== undefined) return inner;
    }
  }
  for (const key of ["items", "anyOf", "oneOf"]) {
    const part = schema[key];
    const parts = Array.isArray(part) ? part : [part];
    for (const child of parts) {
      const inner = isObject(child) ? typeOf(child, name, depth + 1) : undefined;
      if (inner !== undefined) return inner;
    }
  }
  return undefined;
}

function typeLabel(schema: JsonObject): string {
  const variants = Array.isArray(schema.anyOf) ? schema.anyOf.filter(isObject).filter((part) => part.type !== "null") : [];
  const own = variants.length === 1 ? (variants[0] ?? schema) : schema;
  if (variants.length > 1 && variants.every((part) => isNumber(part.const))) return "integer";
  const raw = Array.isArray(own.type) ? own.type.find((item) => item !== "null") : own.type;
  if (raw === "array") {
    const items = isObject(own.items) ? own.items : {};
    return items.type === "object" || Array.isArray(items.anyOf) ? "object[]" : `${isString(items.type) ? items.type : "string"}[]`;
  }
  if (own.format === "date-time") return "string (ISO 8601)";
  if (own.format === "date") return "string (date)";
  if (own.format === "uri") return "string (URL)";
  return isString(raw) ? raw : "object";
}

function responseSection(input: PageInput): string[] {
  const { endpoint, config, response } = input;
  const holds = config.holds[endpoint.id];
  if (holds === undefined) throw new Error(`No "holds" sentence for ${endpoint.id} in reference.config.json`);
  const lead = response.live
    ? "This real response is cut to one item per list."
    : "An example of the shape. The values are made up.";
  const envelope = { success: true, data: response.data, creditsUsed: response.creditsUsed, requestId: REQUEST_ID };
  const notes = fieldNotes(input);
  const extra = bestWhenNotes(endpoint, config);
  return [
    "## Response",
    "",
    holds,
    "",
    lead,
    "",
    "```json",
    showJson(envelope),
    "```",
    ...(notes.length === 0
      ? []
      : [
          "",
          "| Field | Type | Description |",
          "| --- | --- | --- |",
          ...notes.map(([name, note]) => `| ${code(name)} | ${typeOf(input.schema, name) ?? "string"} | ${sentence(linkIds(note, input))} |`),
        ]),
    ...(extra.length === 0 ? [] : ["", `<Note>${linkIds(extra.join(" "), input)}</Note>`]),
  ];
}

const GENERIC_TEXT: [RegExp, string][] = [
  [/^ISO 3166-1 alpha-2 country code, e\.g\. us\. Any case is accepted\.$/, "Two-letter country code, like `us`."],
  [/^ISO 3166-1 alpha-2 country code, or all\. Any case is accepted\.$/, "Two-letter country code, or `all`."],
  [/^Two-letter language code like en or pt\. Any case is accepted\.$/, "Two-letter language code, like `en` or `pt`."],
  [/^BCP 47 language tag, e\.g\. en or pt-BR\. Any case is accepted\.$/, "Language code, like `en` or `pt-BR`."],
  [/^The cursor from the previous response\. Send it as is\.$/, "The `cursor` from the previous response. Send it back unchanged."],
  [/^Page number, starting at 1\.$/, "Page number, starting at 1."],
];

const backtickNames = (text: string) =>
  text
    .split(/(\{[^{}]*\})/)
    .map((part, index) => (index % 2 === 1 ? code(part) : part.replace(/(?<![`\w])([a-z]+[A-Z]\w*)(?![`\w])/g, "`$1`")))
    .join("");

function optionText(op: CatalogEndpoint, name: string, schema: JsonObject, config: TextConfig): string {
  const override = config.optionText[`${op.id}.${name}`];
  if (override !== undefined) return override;
  const given = isString(schema.description) ? schema.description : undefined;
  if (given === undefined) {
    const shared = config.optionText[name];
    if (shared === undefined) problems.push(`No text for option ${name} of ${op.id} in reference.config.json`);
    return shared ?? "";
  }
  const rewritten = config.optionRewrites[given];
  if (rewritten !== undefined) return rewritten;
  const generic = GENERIC_TEXT.find(([pattern]) => pattern.test(given));
  if (generic !== undefined) return generic[1];
  const plain = given.replace(/ Any case is accepted\.$/, "");
  return sentence(backtickNames(plain));
}

const tooBig = (value: number) => Math.abs(value) > 1e9;

function optionValues(op: CatalogEndpoint, name: string, schema: JsonObject, config: TextConfig): string {
  const custom = config.optionValues[`${op.id}.${name}`] ?? config.optionValues[name];
  if (custom !== undefined) return custom;
  const fallback = schema.default;
  const defaultText =
    fallback === undefined || (Array.isArray(fallback) && fallback.length === 0) ? "" : ` Defaults to ${code(String(fallback))}.`;
  const choices = (values: Json[]) =>
    values.length > MAX_ENUM_SHOWN
      ? `One of ${values.length} values, like ${list(values.slice(0, 3).map((value) => code(String(value))), "and")}.`
      : `One of ${list(values.map((value) => code(String(value))), "or")}.`;
  const consts = Array.isArray(schema.anyOf) ? schema.anyOf.filter(isObject).flatMap((part) => (part.const === undefined ? [] : [part.const])) : [];
  if (consts.length > 0) return `${choices(consts)}${defaultText}`;
  if (Array.isArray(schema.enum)) return `${choices(schema.enum)}${defaultText}`;
  const range = (min: Json | undefined, max: Json | undefined, unit: string) => {
    const low = isNumber(min) ? min : undefined;
    const high = isNumber(max) && !tooBig(max) ? max : undefined;
    if (low !== undefined && high !== undefined) return `From ${low} to ${high}.`;
    if (low !== undefined) return low === 0 ? "" : `At least ${low}.`;
    if (high !== undefined) return `At most ${high}.`;
    return unit === "" ? "" : "";
  };
  if (schema.type === "boolean") return defaultText.trim();
  if (schema.type === "integer") return `${range(schema.minimum, schema.maximum, "")}${defaultText}`.trim();
  if (schema.type === "number") return `${range(schema.minimum, schema.maximum, "")}${defaultText}`.trim();
  if (schema.type === "array") {
    const items = isObject(schema.items) ? schema.items : {};
    const cap = isNumber(schema.maxItems) ? ` Up to ${schema.maxItems} values.` : "";
    if (Array.isArray(items.enum)) return `${choices(items.enum)}${cap}`;
    return cap.trim();
  }
  if (schema.format === "date") return `Format: ${code("YYYY-MM-DD")}.`;
  return defaultText.trim();
}

function optionsSection(input: PageInput): string[] {
  const { endpoint, config } = input;
  const chosen = new Set([...required(endpoint), ...sendOne(endpoint)]);
  const rows = Object.entries(schemaProperties(endpoint.input))
    .filter(([name]) => !chosen.has(name))
    .flatMap(([name, schema]) => {
      if (!isObject(schema)) return [];
      const text = sentence(linkIds(optionText(endpoint, name, schema, config), input).replace(/\.$/, ""));
      const values = optionValues(endpoint, name, schema, config);
      return [`| ${code(name)} | ${typeLabel(schema)} | ${[text, values].filter((part) => part !== "").join(" ")} |`];
    });
  if (rows.length === 0) return [];
  return [
    "## Optional parameters",
    "",
    "| Parameter | Type | Description |",
    "| --- | --- | --- |",
    ...rows,
    ...(config.notes[endpoint.id] === undefined ? [] : ["", `<Note>${linkIds(config.notes[endpoint.id] ?? "", input)}</Note>`]),
  ];
}

function pagingText(input: PageInput): string {
  const note = input.config.pagingNotes[input.endpoint.id];
  return `${pagingRule(input)}${note === undefined ? "" : ` ${note}`}`;
}

function pagingRule(input: PageInput): string {
  const { endpoint, config } = input;
  const props = schemaProperties(endpoint.input);
  if ("cursor" in props) {
    const hours = config.cursorHours[endpoint.id];
    const life = hours === undefined ? "" : ` A cursor expires after ${plural(hours, "hour")}.`;
    return `Each call returns one page. For the next one, send ${code("data.cursor")} back as ${code("cursor")}. The last page has no ${code("cursor")}.${life}`;
  }
  const page = props.page;
  if (isObject(page)) {
    const last = isNumber(page.maximum) ? ` ${code("page")} goes up to ${page.maximum}.` : "";
    return `Each call returns one page. Send ${code("page: 2")} for the next one. An empty ${code("data.results")} means you are past the last page.${last}`;
  }
  return "One call returns everything. There are no more pages.";
}

function costSection(input: PageInput): string[] {
  const { endpoint, creditsMax } = input;
  const flat = endpoint.pricing === null || endpoint.pricing === undefined;
  const ceiling = creditsMax === undefined ? "" : ` A call costs at most ${dollars(creditsMax)}.`;
  const price = flat
    ? endpoint.credits === 0
      ? "This call is free."
      : `Each call costs ${dollars(endpoint.credits ?? 1)}, however many items come back.`
    : `${sentence(inDollars(endpoint.pricing ?? ""))}${ceiling}`;
  const limit = "limit" in schemaProperties(endpoint.input) ? ` Send a smaller ${code("limit")} to get fewer items${flat ? "" : " and pay less"}.` : "";
  return [
    "## Price",
    "",
    `${price} A call that fails or finds nothing is free.${limit} Top-ups of $100 or more cost less. See [Pricing](/billing).`,
    "",
    "## Pages",
    "",
    pagingText(input),
  ];
}

const ALIASES = new Map(Object.entries({
  username: ["username", "authorUsername"],
  userUrl: ["userUrl", "authorUrl"],
  subreddit: ["subreddit", "subredditName"],
}));

const identityInput = (name: string) => /(Url|Id|Code)$/.test(name) || ALIASES.has(name);

interface Link {
  id: string;
  sends: string[];
}

function derivedLinks(input: PageInput): Link[] {
  const { endpoint, catalog } = input;
  const returned = fieldNames(input.schema);
  const family = endpoint.id.split(".")[0];
  const pair = endpoint.id.split(".").slice(0, 2).join(".");
  const narrowFamily = /\.(ads|shop)\./.test(endpoint.id);
  const links: (Link & { score: number })[] = [];
  for (const other of catalog) {
    if (other.id === endpoint.id || other.id.split(".")[0] !== family) continue;
    if (narrowFamily && other.id.split(".").slice(0, 2).join(".") !== pair) continue;
    const identities = [...new Set([...sendOne(other), ...required(other)])].filter(identityInput);
    const sends = identities.filter((name) => (ALIASES.get(name) ?? [name]).some((alias) => returned.has(alias)));
    if (sends.length === 0) continue;
    const exact = sends.filter((name) => returned.has(name));
    const score = (exact.length > 0 ? 2 : 1) + (other.id.startsWith(endpoint.id.split(".").slice(0, 2).join(".")) ? 1 : 0);
    const also = required(other).filter((name) => !identities.includes(name) && !sendOne(other).includes(name));
    links.push({ id: other.id, sends: [exact[0] ?? sends[0] ?? "", ...also], score });
  }
  return links.sort((a, b) => b.score - a.score).map(({ id, sends }) => ({ id, sends }));
}

function nextSection(input: PageInput): string[] {
  const { endpoint, catalog, config } = input;
  const byId = new Map(catalog.map((item) => [item.id, item]));
  const forced = config.next[endpoint.id] ?? [];
  const derived = derivedLinks(input).map((link) => [link.id, link] as const);
  const entries = [...forced.map(([id, text]) => [id, text] as const), ...derived.map(([id]) => [id, undefined] as const)]
    .filter(([id], index, all) => all.findIndex(([other]) => other === id) === index)
    .slice(0, MAX_NEXT);
  const lines = entries.map(([id, text]) => {
    const target = byId.get(id);
    if (target === undefined) throw new Error(`Next link ${id} for ${endpoint.id} is not an endpoint`);
    const link = `[${input.label(id)}](/api-reference/endpoint/${input.slug(id)})`;
    const does = sentence(target.summary);
    if (text !== undefined) {
      const accepts = text.match(/^Send (.+?) to /)?.[1];
      return accepts === undefined ? `- ${link}: ${text}` : `- ${link}: Takes ${accepts}. ${does}`;
    }
    const sends = derived.find(([other]) => other === id)?.[1].sends ?? required(target).filter((name) => !sendOne(target).includes(name));
    return sends.length === 0 ? `- ${link}: ${does}` : `- ${link}: Takes ${list(sends.map(code), "and")}. ${does}`;
  });
  return lines.length === 0 ? [] : ["## Related endpoints", "", ...lines];
}

export function opening(op: CatalogEndpoint): string {
  return [sentence(op.summary), whenToUse(op)].filter((part) => part !== "").join(" ");
}

export function requestIntro(op: CatalogEndpoint, config: TextConfig): string {
  const keyless =
    op.keyless === true
      ? "\n\n<Note>Works without an API key, for the first page only, up to 10 calls a minute and 50 a day.</Note>"
      : "";
  return `${requestLine(op, config)}${keyless}`;
}

export function body(input: PageInput, example: string[]): string[] {
  const { endpoint, config } = input;
  const options = optionsSection(input);
  const next = nextSection(input);
  return [
    opening(endpoint),
    "",
    "## Request",
    "",
    requestIntro(endpoint, config),
    "",
    ...example,
    "",
    ...responseSection(input),
    ...(options.length === 0 ? [] : ["", ...options]),
    "",
    ...costSection(input),
    ...(next.length === 0 ? [] : ["", ...next]),
  ].map(inDollars);
}
