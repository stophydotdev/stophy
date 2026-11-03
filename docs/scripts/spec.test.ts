import { expect, test } from "bun:test";
import { pathDrift } from "./spec";

test("pathDrift names paths the docs copy is missing or still has", () => {
  expect(pathDrift(["/v1/usage", "/v1/google/search"], ["/v1/google/search", "/v1/old"])).toEqual({
    extra: ["/v1/old"],
    missing: ["/v1/usage"],
  });
  expect(pathDrift(["/v1/a"], ["/v1/a"])).toEqual({ extra: [], missing: [] });
});
