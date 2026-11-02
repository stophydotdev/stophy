import { expect, test } from "bun:test";
import { dollars, inDollars } from "./catalog";

test("prices read in dollars", () => {
  expect([1, 2, 5, 11, 20, 5000].map(dollars)).toEqual(["$0.0015", "$0.003", "$0.0075", "$0.0165", "$0.03", "$7.50"]);
  expect(inDollars("1 credit per call, plus 2 credits per page. creditsUsed shows it")).toBe(
    "$0.0015 per call, plus $0.003 per page. creditsUsed shows it",
  );
  expect(inDollars("Costs 1 more credit each. A screenshot costs 2 credits, or 5 on the hardest pages")).toBe(
    "Costs $0.0015 more each. A screenshot costs $0.003, or $0.0075 on the hardest pages",
  );
});
