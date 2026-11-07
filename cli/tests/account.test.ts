import { expect, test } from "bun:test";
import { formatBalance } from "../src/account.ts";

test("a balance shows whole credits and no dollars", () => {
  expect(formatBalance(6012)).toBe("6,012 credits");
});
