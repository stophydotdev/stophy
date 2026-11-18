import { expect, test } from "bun:test";
import { formatUsd } from "../src/account.ts";

test("dollars show cents, and more digits only when the amount needs them", () => {
  expect(formatUsd(2)).toBe("$2.00");
  expect(formatUsd(1.9876)).toBe("$1.9876");
  expect(formatUsd(0.0005)).toBe("$0.0005");
  expect(formatUsd(1234.5)).toBe("$1,234.50");
});
