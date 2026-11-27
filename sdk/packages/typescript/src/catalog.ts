import { isBoolean, isNumber, isRecord, isString, type JsonObject, type JsonValue } from "./json";
import type { Caller } from "./transport";
import type { RequestOptions } from "./bind";

export interface ListEndpointsResponse {
  sources: { id: string; name: string; summary: string; kind: "site" | "aiAnswers" }[];
  endpoints: {
    id: string;
    title: string;
    summary: string;
    bestWhen: string | null;
    method: "POST";
    path: string;
    costUsd?: number;
    maxCostUsd?: number;
    pricing: string | null;
    keyless: boolean;
    cacheTtlSeconds: number;
    input: JsonObject;
    example: JsonObject | null;
  }[];
}

export interface ListParsersResponse {
  success: true;
  data: {
    parsers: {
      name: string;
      takes: string;
      example: string;
      options: JsonObject[];
      returns: string[];
      price: string;
      keyless: boolean;
    }[];
    kinds: JsonValue;
  };
}

const objects = (value: JsonValue | undefined): JsonObject[] => {
  if (!Array.isArray(value) || !value.every(isRecord))
    throw new TypeError("Invalid OpenAPI catalog.");
  return value;
};

const readCatalog = async (call: Caller, options?: RequestOptions): Promise<JsonObject> => {
  const document = await call<JsonValue>({ method: "GET", path: "/openapi.json", options });
  const catalog = isRecord(document) ? document["x-stophy-catalog"] : undefined;
  if (!isRecord(catalog)) throw new TypeError("OpenAPI has no Stophy catalog.");
  return catalog;
};

export const endpointsFromOpenApi = async (
  call: Caller,
  options?: RequestOptions,
): Promise<ListEndpointsResponse> => {
  const catalog = await readCatalog(call, options);
  const sources = objects(catalog.sources).map(
    ({ id, name, summary, kind }): ListEndpointsResponse["sources"][number] => {
      if (
        !isString(id) ||
        !isString(name) ||
        !isString(summary) ||
        (kind !== "site" && kind !== "aiAnswers")
      )
        throw new TypeError("Invalid OpenAPI source.");
      return { id, name, summary, kind };
    },
  );
  const endpoints = objects(catalog.endpoints).map(
    ({
      id,
      title,
      summary,
      bestWhen,
      method,
      path,
      costUsd,
      maxCostUsd,
      pricing,
      keyless,
      cacheTtlSeconds,
      input,
      example,
    }): ListEndpointsResponse["endpoints"][number] => {
      if (
        !isString(id) ||
        !isString(title) ||
        !isString(summary) ||
        (bestWhen !== null && !isString(bestWhen)) ||
        method !== "POST" ||
        !isString(path) ||
        (costUsd !== undefined && !isNumber(costUsd)) ||
        (maxCostUsd !== undefined && !isNumber(maxCostUsd)) ||
        (pricing !== null && !isString(pricing)) ||
        !isBoolean(keyless) ||
        !isNumber(cacheTtlSeconds) ||
        !isRecord(input) ||
        (example !== null && !isRecord(example))
      )
        throw new TypeError("Invalid OpenAPI endpoint.");
      return {
        id,
        title,
        summary,
        bestWhen,
        method,
        path,
        costUsd,
        maxCostUsd,
        pricing,
        keyless,
        cacheTtlSeconds,
        input,
        example,
      };
    },
  );
  return { sources, endpoints };
};

export const parsersFromOpenApi = async (
  call: Caller,
  options?: RequestOptions,
): Promise<ListParsersResponse> => {
  const catalog = await readCatalog(call, options);
  const parsers = objects(catalog.parsers).map(
    ({ name, takes, example, options: parserOptions, returns, price, keyless }) => {
      if (
        !isString(name) ||
        !isString(takes) ||
        !isString(example) ||
        !Array.isArray(returns) ||
        !returns.every(isString) ||
        !isString(price) ||
        !isBoolean(keyless)
      )
        throw new TypeError("Invalid OpenAPI parser.");
      return { name, takes, example, options: objects(parserOptions), returns, price, keyless };
    },
  );
  return { success: true, data: { parsers, kinds: catalog.kinds ?? null } };
};
