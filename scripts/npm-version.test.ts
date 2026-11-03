import { expect, test } from "bun:test";
import { decide } from "./npm-version";

test("a version must beat every version npm has ever had, removed ones included", () => {
  const ever = ["1.2.2", "2.0.9", "3.1.0"];
  expect(decide("1.2.2", ["1.2.2"], ever)).toEqual({ kind: "exists" });
  expect(decide("1.2.3", ["1.2.2"], ever)).toEqual({ kind: "behind", highest: "3.1.0" });
  expect(decide("3.1.0", ["1.2.2"], ever)).toEqual({ kind: "behind", highest: "3.1.0" });
  expect(decide("3.2.0", ["1.2.2"], ever)).toEqual({ kind: "new" });
  expect(decide("1.0.0", [], [])).toEqual({ kind: "new" });
  expect(decide("1.10.0", [], ["1.9.0"])).toEqual({ kind: "new" });
});
