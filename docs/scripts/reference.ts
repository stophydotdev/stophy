import { z } from "zod";
import { type Json, isObject, isString, jsonObject } from "./catalog";

const names = z.record(z.string(), z.string());

const callPlan = z.object({
  body: jsonObject.optional(),
  before: z.object({ operation: z.string(), body: jsonObject, keep: names }).optional(),
  use: names.optional(),
  keep: names.optional(),
  until: z.literal("finished").optional(),
});

export const referenceConfig = z.object({
  groups: z.array(z.object({ group: z.string(), operations: z.array(z.string()) })),
  titles: names,
  calls: z.record(z.string(), callPlan),
  notCalled: names,
  masks: z.record(z.string(), jsonObject),
  inCredits: names,
  parserPages: z.array(
    z.object({ slug: z.string(), title: z.string(), icon: z.string(), description: z.string(), parsers: z.array(z.string()) }),
  ),
});

export type ReferenceConfig = z.infer<typeof referenceConfig>;

export const recorded = z.object({
  request: z.object({ method: z.string(), path: z.string(), body: jsonObject.optional() }),
  status: z.number(),
  response: jsonObject,
});

export type Recorded = z.infer<typeof recorded>;

const MAX_STRING = 120;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const PHONE = /\+\d[\d\s().-]{6,}\d|\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g;
const SECRET_FIELDS = new Set(["code", "claimUrl", "key", "apiKey"]);
const KEPT_WHOLE = new Set(["id", "requestId", "scrapeId", "next", "cursor"]);

const cutAtWord = (text: string) => {
  const cut = text.slice(0, MAX_STRING - 1);
  const space = cut.search(/\s\S*$/);
  return `${space > MAX_STRING / 2 ? cut.slice(0, space) : cut}…`;
};

export const shorten = (value: Json, name = ""): Json => {
  if (isString(value)) {
    if (SECRET_FIELDS.has(name)) return `<${name}>`;
    const masked = value.replace(EMAIL, "name@example.com").replace(PHONE, "+1 555 0100");
    return masked.length > MAX_STRING && !KEPT_WHOLE.has(name) ? cutAtWord(masked) : masked;
  }
  if (Array.isArray(value)) return value.slice(0, value.every(isObject) ? 1 : 3).map((item) => shorten(item, name));
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, shorten(item, field)]));
  return value;
};

export const mdxSafe = (text: string) =>
  text.replace(/\[?\{[^{}]*\}\]?|<[A-Za-z][^<>]*>/g, (code) => `\`${code}\``);
