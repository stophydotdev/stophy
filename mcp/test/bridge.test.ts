import { expect, jest, test } from "bun:test";
import { PassThrough } from "node:stream";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { connectBridge } from "../src/bridge";

function pendingTool() {
  const started = Promise.withResolvers<void>();
  const finish = Promise.withResolvers<void>();
  const aborted = Promise.withResolvers<void>();
  return { started, finish, aborted };
}

async function fixture(tools: ReadonlyMap<string, ReturnType<typeof pendingTool>>) {
  const http = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const hosted = new Server({ name: "fixture", version: "1" }, { capabilities: { tools: {} } });
      hosted.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
        const key = String(params.arguments?.["url"] ?? params.arguments?.["prompt"]);
        const tool = tools.get(key);
        if (tool === undefined) throw new Error(`Unexpected call: ${key}`);
        request.signal.addEventListener("abort", () => {
          tool.aborted.resolve();
          tool.finish.resolve();
        });
        tool.started.resolve();
        await tool.finish.promise;
        return { content: [{ type: "text", text: key }] };
      });
      const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
      await hosted.connect(transport);
      try {
        return await transport.handleRequest(request);
      } finally {
        await hosted.close();
      }
    },
  });
  const input = new PassThrough();
  const output = new PassThrough();
  const bridge = await connectBridge(http.url, {}, new StdioServerTransport(input, output));
  const client = new Client({ name: "fixture", version: "1" });
  await client.connect(new StdioServerTransport(output, input));
  return {
    client,
    async [Symbol.asyncDispose]() {
      for (const tool of tools.values()) tool.finish.resolve();
      await client.close();
      await bridge.close();
      await http.stop(true);
    },
  };
}

const scrape = (client: Client, url: string, signal?: AbortSignal) =>
  client.callTool({ name: "stophy_scrape", arguments: { url, timeout: 120_000 } }, undefined, {
    signal,
    timeout: 360_000,
  });

test("aborting one stdio call stops only its hosted HTTP request", async () => {
  const first = pendingTool();
  const second = pendingTool();
  await using upstream = await fixture(
    new Map([
      ["first", first],
      ["second", second],
    ]),
  );
  const controller = new AbortController();
  const canceled = scrape(upstream.client, "first", controller.signal);
  const succeeds = scrape(upstream.client, "second");
  await Promise.all([first.started.promise, second.started.promise]);
  controller.abort();
  await expect(canceled).rejects.toThrow();
  await first.aborted.promise;
  second.finish.resolve();
  expect(await succeeds).toEqual({ content: [{ type: "text", text: "second" }] });
});

test.each([
  ["stophy_scrape", 61_000, { url: "slow", timeout: 120_000 }],
  ["stophy_extract", 344_000, { prompt: "slow", urls: ["https://example.com"], timeout: 300_000 }],
])("%s can finish at %i milliseconds within its total budget", async (name, elapsed, args) => {
  const slow = pendingTool();
  await using upstream = await fixture(new Map([["slow", slow]]));
  jest.useFakeTimers();
  try {
    const result = upstream.client.callTool({ name, arguments: args }, undefined, {
      timeout: 360_000,
    });
    await slow.started.promise;
    jest.advanceTimersByTime(elapsed);
    slow.finish.resolve();
    expect(await result).toEqual({ content: [{ type: "text", text: "slow" }] });
  } finally {
    jest.useRealTimers();
  }
});
