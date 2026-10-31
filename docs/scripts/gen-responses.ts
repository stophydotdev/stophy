import { z } from "zod";
import { type Json, type JsonObject, fetchCatalog, isNumber, isObject, isString, jsonObject } from "./catalog";

const root = new URL("..", import.meta.url);
const liveDir = process.env.STOPHY_LIVE_DIR;
if (liveDir === undefined) throw new Error("Set STOPHY_LIVE_DIR to the folder with the saved calls.");

const savedCall = z.object({ output: jsonObject });

const MAX_STRING = 120;
const PRIVATE_FIELDS = new Set(["agentName", "agentPhone", "agentEmail", "developerEmail"]);
const PHONE_FIELD = /phone/i;

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const PHONE = /\+\d[\d\s().-]{6,}\d|\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g;

const maskContacts = (text: string) => text.replace(EMAIL, "name@example.com").replace(PHONE, "+1 555 0100");

const isEmpty = (value: Json) =>
  value === null || value === "" || (Array.isArray(value) && value.length === 0) || (isObject(value) && Object.keys(value).length === 0);

const kindOf = (item: Json) => {
  if (!isObject(item)) return undefined;
  const kind = item.type ?? item.kind;
  return isString(kind) ? kind : undefined;
};

function withoutEmptyEntries(value: JsonObject): JsonObject {
  const entries = Object.entries(value)
    .filter(([key]) => !PRIVATE_FIELDS.has(key))
    .map(([key, item]) => [key, PHONE_FIELD.test(key) && isString(item) ? "+1 555 0100" : withoutEmptyValues(item)] as const)
    .filter(([, item]) => !isEmpty(item));
  return Object.fromEntries(entries);
}

function withoutEmptyValues(value: Json): Json {
  if (Array.isArray(value)) return value.map(withoutEmptyValues).filter((item) => !isEmpty(item));
  if (isObject(value)) return withoutEmptyEntries(value);
  return isString(value) ? maskContacts(value) : value;
}

const PERSONAL = /cancer|surviv|diagnos|funeral|surgery|chemo|my (late )?(wife|husband|son|daughter|mother|father|mom|dad)\b|bankrupt|foreclos|my address/i;
const isPersonal = (row: Json): boolean => JSON.stringify(row).match(PERSONAL) !== null;

function sampleRows(all: Json[]): Json[] {
  const list = all.filter((row) => !isPersonal(row));
  const kinds = [...new Set(list.map(kindOf))];
  if (kinds.length < 2 || kinds[0] === undefined) return list.slice(0, 1);
  return kinds.slice(0, 2).flatMap((kind) => list.filter((item) => kindOf(item) === kind).slice(0, 1));
}

function cutAtWord(text: string): string {
  const cut = text.slice(0, MAX_STRING - 1);
  const space = cut.search(/\s\S*$/);
  return space > MAX_STRING / 2 ? cut.slice(0, space) : cut;
}

function shorten(value: Json, top: boolean): Json {
  if (isString(value)) return value.length > MAX_STRING ? `${cutAtWord(value)}…` : value;
  if (Array.isArray(value)) {
    const kept = top ? sampleRows(value) : value.slice(0, value.every(isObject) ? 1 : 2);
    return kept.map((item) => shorten(item, false));
  }
  if (isObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shorten(item, false)]));
  }
  return value;
}

function trim(data: JsonObject): JsonObject {
  const cleaned = withoutEmptyEntries(data);
  return Object.fromEntries(Object.entries(cleaned).map(([key, item]) => [key, shorten(item, true)]));
}

const itemCount = (data: JsonObject) =>
  Object.values(data).filter(Array.isArray).reduce((most, list) => Math.max(most, list.length), 0);

function creditsUsed(pricing: string | null | undefined, credits: number, data: JsonObject): number {
  const per = pricing?.match(/(\d+) credits? per (\d+)/);
  if (per !== null && per !== undefined) return Math.max(credits, Math.ceil(itemCount(data) / Number(per[2])) * Number(per[1]));
  const seconds = data.transcribedSeconds;
  if (isNumber(seconds)) return 2 + Math.ceil(seconds / 10);
  return credits;
}

const catalog = await fetchCatalog();
let written = 0;
for (const op of catalog.endpoints) {
  const saved = Bun.file(`${liveDir}/${op.id}.json`);
  if (!(await saved.exists())) continue;
  const { output } = savedCall.parse(await saved.json());
  const data = trim(output);
  if (Object.keys(data).length === 0) continue;
  const body = { live: true, creditsUsed: creditsUsed(op.pricing, op.credits ?? 1, output), data };
  await Bun.write(new URL(`scripts/responses/${op.id}.json`, root), `${JSON.stringify(body, null, 2)}\n`);
  written += 1;
}
console.log(`Wrote ${written} example responses.`);
