import {
  type JsonRecord,
  type JsonValue,
  isJsonRecord,
  readPrimitive,
  readString,
} from "./json.js";

const TITLE_KEYS = ["title", "name", "headline", "keyword", "phrase", "query", "text", "username"];
const OWNER_KEYS = [
  "channelName",
  "authorName",
  "pageName",
  "advertiserName",
  "sellerName",
  "brandName",
];
const URL_KEYS = ["url", "videoUrl", "postUrl", "placeUrl", "link"];
const SKIPPED_URL = /thumbnail|avatar|image|photo|icon|logo/iu;

type Row = JsonRecord;

function firstString(row: Row, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = readString(row[key]);
    if (value) return value;
  }
  return undefined;
}

function urlOf(row: Row): string | undefined {
  const named = firstString(row, URL_KEYS);
  if (named) return named;
  for (const [key, value] of Object.entries(row)) {
    const text = readString(value);
    if (key.endsWith("Url") && !SKIPPED_URL.test(key) && text) return text;
  }
  return undefined;
}

function oneLine(text: string, max = 140): string {
  const flat = text.replace(/\s+/gu, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function scalar(value: JsonValue | undefined): string {
  if (Array.isArray(value)) return value.map(scalar).join(", ");
  if (isJsonRecord(value)) return JSON.stringify(value);
  return String(value);
}

function isPage(row: Row): row is Row & { url: string } {
  return (
    readString(row.url) !== undefined && (isJsonRecord(row.error) || isJsonRecord(row.metadata))
  );
}

function renderRow(item: JsonValue, index: number): string {
  const prefix = `${index + 1}. `;
  if (!isJsonRecord(item)) return `${prefix}${oneLine(scalar(item))}`;
  if (isPage(item)) {
    const { url, ...page } = item;
    return [`${prefix}${url}`, renderData(page)].join("\n");
  }
  const title = firstString(item, TITLE_KEYS);
  const owner = firstString(item, OWNER_KEYS);
  const url = urlOf(item);
  if (!title && !url) return `${prefix}${oneLine(JSON.stringify(item), 200)}`;
  const head = [title ? oneLine(title) : url, owner]
    .filter((part) => part !== undefined)
    .join(" - ");
  return [`${prefix}${head}`, ...(title && url ? [`   ${url}`] : [])].join("\n");
}

export function renderData(data: JsonValue | undefined): string {
  if (!isJsonRecord(data)) return data === undefined ? "" : scalar(data);
  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (Array.isArray(value) && value.some((item) => readPrimitive(item) === undefined)) {
      if (key !== "results") lines.push(`${key}:`);
      lines.push(...value.map(renderRow));
      continue;
    }
    lines.push(`${key}: ${scalar(value)}`);
  }
  const results = data.results;
  if (Array.isArray(results) && results.length === 0) {
    lines.unshift("No results.");
  }
  return lines.join("\n");
}
