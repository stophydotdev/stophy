import { expect, test } from "bun:test";
import { findings } from "./check-text";

test("only the published MCP URLs and no Cursor Marketplace link pass", () => {
  expect(findings("a.md", "Use https://mcp.stophy.dev/mcp or https://api.stophy.dev/mcp.")).toEqual(
    [],
  );
  expect(findings("a.md", "Use https://api.stophy.dev/mcp-oauth.")).toHaveLength(1);
  expect(
    findings("a.md", "From the [Cursor Marketplace](https://cursor.com/marketplace)."),
  ).toHaveLength(1);
});
