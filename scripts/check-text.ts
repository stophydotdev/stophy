import { $ } from "bun";

interface Rule {
  pattern: RegExp;
  message: string;
  paths?: RegExp;
}

export const RULES: readonly Rule[] = [
  {
    message: "Over MCP, endpoint ids are camelCase, like redditSearch, not reddit.search.",
    paths: /^(docs\/mcp-server|mcp\/README)/u,
    pattern:
      /`(airbnb|amazon|appstore|booking|careers|chatgpt|craigslist|ebay|expedia|facebook|gemini|glassdoor|google|indeed|instagram|linkedin|luma|meta|pinterest|realtor|reddit|threads|tiktok|tripadvisor|trustpilot|upwork|web|x|yelp|youtube|zillow)(\.[a-z]+)+`/u,
  },
  {
    message:
      "Claude Desktop connects to https://mcp.stophy.dev/mcp as a custom connector, not the local package.",
    paths: /^docs\/quickstarts\/claude-desktop\.mdx$/u,
    pattern: /@stophy\/mcp/u,
  },
  {
    message:
      "Never show a key on a command line. Use stophy login --api-key, which asks for it, or STOPHY_API_KEY from a secret store.",
    pattern: /--api-key\s+st_|STOPHY_API_KEY=["']?st_/u,
  },
  {
    message:
      "Use https://mcp.stophy.dev/mcp (sign in) or https://api.stophy.dev/mcp (key or no key).",
    pattern: /stophy\.dev\/mcp-oauth/u,
  },
  {
    message:
      "Stophy isn't listed in the Cursor Marketplace. Link cursor.directory/plugins/stophy instead.",
    pattern: /cursor\.com\/marketplace/u,
  },
  {
    message: "Stophy isn't listed on Smithery. smithery.ai/servers/stophy/mcp is a 404.",
    pattern: /smithery\.ai\/(servers|badge)\/stophy/u,
  },
];

const SKIPPED = /(^|\/)(CHANGELOG\.md|node_modules\/|bun\.lock)|^scripts\/check-text/u;

export const findings = (path: string, text: string) =>
  text
    .split("\n")
    .flatMap((line, index) =>
      RULES.filter((rule) => (rule.paths?.test(path) ?? true) && rule.pattern.test(line)).map(
        (rule) => `${path}:${index + 1}: ${rule.message}`,
      ),
    );

if (import.meta.main) {
  const paths = (await $`git ls-files`.text())
    .split("\n")
    .filter((path) => path !== "" && !SKIPPED.test(path));
  const found = (
    await Promise.all(paths.map(async (path) => findings(path, await Bun.file(path).text())))
  ).flat();
  for (const line of found) console.error(line);
  if (found.length > 0) process.exit(1);
}
