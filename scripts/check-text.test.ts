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

test("MCP pages name endpoints in camelCase", () => {
  expect(
    findings("docs/mcp-server.mdx", "your agent finds `reddit.search` and calls it"),
  ).toHaveLength(1);
  expect(findings("docs/mcp-server.mdx", "your agent finds `redditSearch` and calls it")).toEqual(
    [],
  );
  expect(findings("docs/quickstart.mdx", "call `reddit.search`")).toEqual([]);
});

test("file names on MCP pages are not endpoint ids", () => {
  expect(
    findings(
      "mcp/README.md",
      "The plugin manifests (`.mcp.json`, `mcp.json`) only point at the server.",
    ),
  ).toEqual([]);
});

test("a key never appears on a command line", () => {
  expect(findings("a.md", "stophy login --api-key st_...")).toHaveLength(1);
  expect(findings("a.md", 'export STOPHY_API_KEY="st_..."')).toHaveLength(1);
  expect(findings("a.md", "stophy login --api-key")).toEqual([]);
});

test("the Claude Desktop page uses the connector, not the local package", () => {
  expect(
    findings("docs/quickstarts/claude-desktop.mdx", '"args": ["-y", "@stophy/mcp"]'),
  ).toHaveLength(1);
  expect(findings("mcp/README.md", '"args": ["-y", "@stophy/mcp"]')).toEqual([]);
});
