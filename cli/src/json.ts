import { z } from "zod";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonRecord = { [key: string]: JsonValue };

export function isJsonRecord(value: unknown): value is JsonRecord {
  return value instanceof Object && !Array.isArray(value);
}

export const jsonRecord = z.custom<JsonRecord>(isJsonRecord);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const readString = (value: JsonValue | undefined) =>
  typeof value === "string" ? value : undefined;
export const readNumber = (value: JsonValue | undefined) =>
  isFiniteNumber(value) ? value : undefined;
export const readBoolean = (value: JsonValue | undefined) =>
  typeof value === "boolean" ? value : undefined;
export const readPrimitive = (value: JsonValue | undefined) =>
  typeof value === "string" || typeof value === "boolean" || isFiniteNumber(value)
    ? value
    : undefined;
export const readStringList = (value: JsonValue | undefined) =>
  Array.isArray(value) && value.every((item) => typeof item === "string") ? value : undefined;
export const readNumberList = (value: JsonValue | undefined) =>
  Array.isArray(value) && value.every(isFiniteNumber) ? value : undefined;
