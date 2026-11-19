import { AsyncLocalStorage } from "node:async_hooks";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolListChangedNotificationSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import packageJson from "../package.json" with { type: "json" };

const DEFAULT_URL = "https://api.stophy.dev/mcp";
const RESPONSE_GRACE_MS = 5_000;
const DEFAULT_BUDGET_MS = 60_000;
const MAX_REQUEST_MS = 299_000;

const toolTimeout = ({ name, arguments: args }: CallToolRequest["params"]): number => {
  const value = args?.["timeout"];
  const requested = Number.isSafeInteger(value) && Number(value) > 0 ? Number(value) : undefined;
  let budget: number;
  switch (name) {
    case "stophy_scrape":
      budget = Math.min(requested ?? DEFAULT_BUDGET_MS, 300_000);
      break;
    case "stophy_search":
      budget = Math.min(requested ?? DEFAULT_BUDGET_MS, 120_000);
      break;
    case "stophy_extract":
      budget = Math.min(requested ?? 30_000, 300_000) + 45_000;
      break;
    case "stophy_map":
      budget = requested ?? DEFAULT_BUDGET_MS;
      break;
    case "browserRun":
    case "browserExecute":
    case "scrapeInteract":
      budget = Math.min(requested ?? (args?.["prompt"] === undefined ? 30 : 120), 300) * 1_000;
      break;
    default:
      budget = DEFAULT_BUDGET_MS;
  }
  return Math.min(MAX_REQUEST_MS, Math.max(DEFAULT_BUDGET_MS, budget) + RESPONSE_GRACE_MS);
};

const toolHttpSignal = new AsyncLocalStorage<AbortSignal>();

class HostedTransport extends StreamableHTTPClientTransport {
  override send(...[message, options]: Parameters<StreamableHTTPClientTransport["send"]>) {
    if ("method" in message && "id" in message && message.method === "tools/call") {
      return super.send(message, options);
    }
    return toolHttpSignal.exit(() => super.send(message, options));
  }
}

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

const connectHosted = async (url: URL): Promise<Client> => {
  const client = new Client({ name: "stophy-mcp", version: packageJson.version });
  const transport = new HostedTransport(url, {
    requestInit: { headers: headers() },
    fetch: (input, init) => {
      const signal = toolHttpSignal.getStore();
      if (!signal) return fetch(input, init);
      const session = init?.signal;
      return fetch(input, {
        ...init,
        signal: session ? (AbortSignal.any?.([signal, session]) ?? signal) : signal,
      });
    },
  });
  await client.connect(transport);
  return client;
};

const main = async (): Promise<void> => {
  const url = hostedUrl();
  let hosted: Client;
  try {
    hosted = await connectHosted(url);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const hint = /401|unauthorized/iu.test(reason)
      ? " Check STOPHY_API_KEY, or unset it to use the free endpoints only."
      : "";
    throw new Error(`Could not connect to Stophy at ${url.origin}: ${reason}.${hint}`, {
      cause: error,
    });
  }

  const local = new Server(
    { name: "stophy", version: packageJson.version },
    {
      capabilities: { tools: { listChanged: true } },
      instructions: hosted.getInstructions(),
    },
  );

  local.setRequestHandler(ListToolsRequestSchema, (request) => hosted.listTools(request.params));
  local.setRequestHandler(CallToolRequestSchema, async ({ params }, { signal }) => {
    const http = new AbortController();
    try {
      return await toolHttpSignal.run(http.signal, () =>
        hosted.callTool(params, undefined, { signal, timeout: toolTimeout(params) }),
      );
    } catch (error) {
      http.abort();
      throw error;
    }
  });
  hosted.setNotificationHandler(ToolListChangedNotificationSchema, () =>
    local.sendToolListChanged(),
  );

  local.onclose = () => {
    void hosted.close();
  };
  await local.connect(new StdioServerTransport());
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
