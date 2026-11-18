import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import packageJson from "../package.json" with { type: "json" };
import { connectBridge } from "./bridge";

const DEFAULT_URL = "https://api.stophy.dev/mcp";

const hostedUrl = (): URL => {
  const value = process.env["STOPHY_MCP_URL"] ?? DEFAULT_URL;
  try {
    return new URL(value);
  } catch {
    throw new Error(`STOPHY_MCP_URL is not a valid URL: ${value}`);
  }
};

const headers = (): Record<string, string> => {
  const key = process.env["STOPHY_API_KEY"]?.trim();
  const userAgent = { "User-Agent": `stophy-mcp/${packageJson.version}` };
  return key ? { ...userAgent, Authorization: `Bearer ${key}` } : userAgent;
};

const main = async (): Promise<void> => {
  await connectBridge(hostedUrl(), headers(), new StdioServerTransport());
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
