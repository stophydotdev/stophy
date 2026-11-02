import { z } from "zod";

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };

export const json: z.ZodType<Json> = z.lazy(() =>
  z.union([z.null(), z.boolean(), z.number(), z.string(), z.array(json), z.record(z.string(), json)]),
);
export const jsonObject = z.record(z.string(), json);

const stringValue = z.string();
const numberValue = z.number();
const booleanValue = z.boolean();
const plainObject = z.record(z.string(), z.unknown());
const names = z.array(z.string());

export const isString = (value: Json | undefined): value is string => stringValue.safeParse(value).success;
export const isNumber = (value: Json | undefined): value is number => numberValue.safeParse(value).success;
export const isBoolean = (value: Json | undefined): value is boolean => booleanValue.safeParse(value).success;
export const isObject = (value: Json | undefined): value is JsonObject => plainObject.safeParse(value).success;

export const schemaProperties = (schema: Json | undefined): JsonObject =>
  isObject(schema) && isObject(schema.properties) ? schema.properties : {};

export const namesAt = (schema: JsonObject | undefined, key: string): string[] => {
  const parsed = names.safeParse(schema?.[key]);
  return parsed.success ? parsed.data : [];
};

const catalogEndpoint = z.object({
  id: z.string(),
  title: z.string().optional(),
  summary: z.string(),
  bestWhen: z.string().nullish(),
  method: z.enum(["GET", "POST"]),
  path: z.string(),
  credits: z.number().optional(),
  pricing: z.string().nullish(),
  keyless: z.boolean().optional(),
  input: jsonObject.optional(),
  example: jsonObject.nullish(),
});

const catalogSource = z.object({
  id: z.string(),
  name: z.string().optional(),
  summary: z.string(),
});

const catalog = z.object({
  sources: z.array(catalogSource),
  endpoints: z.array(catalogEndpoint),
});

const savedCatalog = z.union([
  catalog,
  z.array(catalogEndpoint).transform((endpoints): Catalog => ({ sources: [], endpoints })),
]);

export type CatalogEndpoint = z.infer<typeof catalogEndpoint>;
export type Catalog = z.infer<typeof catalog>;

export const CATALOG_URL = process.env.STOPHY_CATALOG_URL ?? "https://api.stophy.dev/v1/endpoints";

export async function fetchCatalog(): Promise<Catalog> {
  if (!/^https?:/.test(CATALOG_URL)) return savedCatalog.parse(await Bun.file(CATALOG_URL).json());
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error(`GET ${CATALOG_URL} returned ${response.status}`);
  return catalog.parse(await response.json());
}

const DOLLARS_PER_UNIT = 0.0015;

export const dollars = (units: number): string => {
  const amount = units * DOLLARS_PER_UNIT;
  return `$${amount >= 1 ? amount.toFixed(2) : String(Number(amount.toFixed(4)))}`;
};

export const inDollars = (text: string): string =>
  text
    .replace(/\b(\d+) credits?, or (\d+)\b/g, (_, low: string, high: string) => `${dollars(Number(low))}, or ${dollars(Number(high))}`)
    .replace(/\b(\d+) (more )?credits?\b/g, (_, units: string, more = "") => `${dollars(Number(units))}${more === "" ? "" : " more"}`);
