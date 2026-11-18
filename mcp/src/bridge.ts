import { AsyncLocalStorage } from "node:async_hooks";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type {
  Transport,
  TransportSendOptions,
} from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  CallToolRequestSchema,
  isJSONRPCRequest,
  type JSONRPCMessage,
  ListToolsRequestSchema,
  ToolListChangedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";
import packageJson from "../package.json" with { type: "json" };

const toolTimeouts = new Map([
  ["stophy_search", 130_000],
  ["stophy_scrape", 310_000],
  ["stophy_extract", 350_000],
  ["stophy_parse", 80_000],
  ["stophy_map", 305_000],
  ["browserRun", 305_000],
]);

const callSignal = new AsyncLocalStorage<AbortSignal>();

class HostedTransport extends StreamableHTTPClientTransport {
  override send(message: JSONRPCMessage | JSONRPCMessage[], options?: TransportSendOptions) {
    const send = () => super.send(message, options);
    return isJSONRPCRequest(message) && message.method === "tools/call"
      ? send()
      : callSignal.exit(send);
  }
}

export async function connectBridge(
  url: URL,
  headers: Record<string, string>,
  localTransport: Transport,
): Promise<Server> {
  const hosted = new Client({ name: "stophy-mcp", version: packageJson.version });
  const transport = new HostedTransport(url, {
    requestInit: { headers },
    fetch: (input, init) => {
      const signal = callSignal.getStore();
      return signal === undefined ? fetch(input, init) : fetch(input, { ...init, signal });
    },
  });
  try {
    await hosted.connect(transport);
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
      return await callSignal.run(http.signal, () =>
        hosted.callTool(params, undefined, {
          signal,
          timeout: toolTimeouts.get(params.name) ?? 65_000,
        }),
      );
    } catch (error) {
      http.abort(error);
      throw error;
    }
  });
  hosted.setNotificationHandler(ToolListChangedNotificationSchema, () =>
    local.sendToolListChanged(),
  );

  local.onclose = () => {
    void hosted.close();
  };
  await local.connect(localTransport);
  return local;
}
