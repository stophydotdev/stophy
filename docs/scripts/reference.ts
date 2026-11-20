import { z } from "zod";
import { type Json, isObject, isString, jsonObject } from "./catalog";

const names = z.record(z.string(), z.string());

const callPlan = z.object({
  body: jsonObject.optional(),
  query: names.optional(),
  before: z.object({ operation: z.string(), body: jsonObject, keep: names }).optional(),
  use: names.optional(),
  keep: names.optional(),
  until: z.literal("finished").optional(),
});

export const referenceConfig = z.object({
  groups: z.array(z.object({ group: z.string(), operations: z.array(z.string()) })),
  alsoGet: z.record(z.string(), z.string()).default({}),
  titles: names,
  calls: z.record(z.string(), callPlan),
  notCalled: names,
  masks: z.record(z.string(), jsonObject),
  descriptions: names,
  parserCategories: z.array(z.object({ slug: z.string(), title: z.string(), parsers: z.array(z.string()) })),
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
const SECRET_FIELDS = new Set(["claimUrl", "key", "apiKey", "secret", "signingSecret", "cookie", "uploadUrl", "recordingUrl", "cdpUrl", "liveViewUrl", "interactiveLiveViewUrl"]);
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

const IMAGE_FIELD = /^(?:image|thumbnail)/i;
const REDIRECT_LINK = /^https?:\/\/[^?#]*\?[^#]*=https?(?::|%3A)/i;

export const hideSearchLinks = (value: Json, name = ""): Json => {
  if (isString(value)) return (IMAGE_FIELD.test(name) && /^https?:/.test(value)) || REDIRECT_LINK.test(value) ? "https://example.com/" : value;
  if (Array.isArray(value)) return value.map((item) => hideSearchLinks(item, name));
  if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, hideSearchLinks(item, field)]));
  return value;
};

const PERSON_PLACEHOLDERS = new Map(
  Object.entries({
    id: "0",
    name: "Example user",
    handle: "example_user",
    url: "https://example.com/example_user",
    avatarUrl: null,
    bio: null,
  }),
);

export const anonymize = (root: JsonObject): JsonObject => {
  const profile = isObject(root.data) && isObject(root.data.json) ? root.data.json : root;
  const subject = isString(profile.handle) ? profile.handle : undefined;
  const isPrivate = (value: JsonObject, key: string, inList: boolean) => {
    if (subject !== undefined && value.handle === subject) return false;
    const redditUser = isString(value.url) && value.url.includes("reddit.com/user/");
    const follower = "handle" in value && "followers" in value;
    return (inList && (key === "author" || key === "hosts" || key === "seller" || follower)) || (key === "author" && redditUser);
  };
  const walk = (value: Json, key: string, inList: boolean): Json => {
    if (Array.isArray(value)) return value.map((item) => walk(item, key, true));
    if (!isObject(value)) return value;
    if (isPrivate(value, key, inList)) {
      return Object.fromEntries(
        Object.entries(value).map(([field, item]) => [field, isString(item) && PERSON_PLACEHOLDERS.has(field) ? (PERSON_PLACEHOLDERS.get(field) ?? null) : item]),
      );
    }
    return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, walk(item, field, inList)]));
  };
  const result = walk(root, "", false);
  return isObject(result) ? result : root;
};

export const mdxSafe = (text: string) =>
  text.replace(/\[?\{[^{}]*\}\]?|<[A-Za-z][^<>]*>/g, (code) => `\`${code}\``);

