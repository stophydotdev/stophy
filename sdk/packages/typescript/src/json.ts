export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;

export interface JsonObject {
  [key: string]: JsonValue;
}

type MaybeJson = JsonValue | undefined;

function tagOf(value: MaybeJson): string {
  return Object.prototype.toString.call(value);
}

export function isString(value: MaybeJson): value is string {
  return tagOf(value) === "[object String]";
}

export function isNumber(value: MaybeJson): value is number {
  return tagOf(value) === "[object Number]";
}

export function isBoolean(value: MaybeJson): value is boolean {
  return value === true || value === false;
}

export function isRecord(value: MaybeJson): value is JsonObject {
  return tagOf(value) === "[object Object]";
}
