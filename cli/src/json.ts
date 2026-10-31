import { z } from "zod";

export const jsonValue = z.json();
export type JsonValue = z.infer<typeof jsonValue>;
export type JsonRecord = Record<string, JsonValue>;

export const jsonRecord = z.record(z.string(), jsonValue);

const text = z.string();
const finiteNumber = z.number();
const flag = z.boolean();
const textList = z.array(text);
const numberList = z.array(finiteNumber);
const primitive = z.union([text, finiteNumber, flag]);

export const readString = (value: JsonValue | undefined) => text.safeParse(value).data;
export const readNumber = (value: JsonValue | undefined) => finiteNumber.safeParse(value).data;
export const readBoolean = (value: JsonValue | undefined) => flag.safeParse(value).data;
export const readPrimitive = (value: JsonValue | undefined) => primitive.safeParse(value).data;
export const readStringList = (value: JsonValue | undefined) => textList.safeParse(value).data;
export const readNumberList = (value: JsonValue | undefined) => numberList.safeParse(value).data;

export function isJsonRecord(value: JsonValue | undefined): value is JsonRecord {
  return value instanceof Object && !Array.isArray(value);
}

export function parseJson(source: string): JsonValue {
  return jsonValue.parse(JSON.parse(source));
}
