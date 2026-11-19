import { once, EventEmitter } from "node:events";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import {
  JSONRPCMessageSchema,
  LATEST_PROTOCOL_VERSION,
  type CallToolRequest,
  type CallToolResult,
  type JSONRPCNotification,
  type JSONRPCRequest,
} from "@modelcontextprotocol/sdk/types.js";

export const startHosted = () => {
  const calls = new AsyncQueue<{
    message: JSONRPCRequest;
    disconnected: Promise<string>;
    reply: (result: CallToolResult) => void;
  }>();
  const cancellations = new AsyncQueue<JSONRPCNotification>();
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    idleTimeout: 0,
    async fetch(request) {
      if (request.method !== "POST") return new Response(null, { status: 405 });
      const body = await request.text();
      const message = JSONRPCMessageSchema.parse(JSON.parse(body));
      if (!("method" in message)) return new Response(null, { status: 400 });
      if (!("id" in message)) {
        if (message.method === "notifications/cancelled") cancellations.push(message);
        return new Response(null, { status: 202 });
      }
      const reply = (result: CallToolResult) =>
        Response.json({ jsonrpc: "2.0", id: message.id, result });
      if (message.method === "initialize") {
        return Response.json({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: LATEST_PROTOCOL_VERSION,
            capabilities: { tools: {} },
            serverInfo: { name: "fixture", version: "1" },
          },
        });
      }
      const response = Promise.withResolvers<Response>();
      const disconnected = Promise.withResolvers<string>();
      request.signal.addEventListener("abort", () => {
        disconnected.resolve("disconnected");
        response.resolve(new Response(null, { status: 499 }));
      });
      calls.push({
        message,
        disconnected: disconnected.promise,
        reply: (result) => response.resolve(reply(result)),
      });
      return response.promise;
    },
  });
  return {
    url: server.url.href,
    next: () => calls.next(),
    nextCancellation: () => cancellations.next(),
    close: () => server.stop(true),
  };
};

class AsyncQueue<T> {
  private pending = Promise.withResolvers<void>();
  private readonly items: T[] = [];

  push(value: T) {
    this.items.push(value);
    this.pending.resolve();
  }

  async next(): Promise<T> {
    while (this.items.length === 0) {
      await this.pending.promise;
      this.pending = Promise.withResolvers<void>();
    }
    const value = this.items.shift();
    if (value === undefined) throw new Error("Queue is empty");
    return value;
  }
}

export const startBridge = async (url: string, entry = process.env["STOPHY_MCP_TEST_ENTRY"]) => {
  const clock = new EventEmitter<{ advanced: [] }>();
  const child = Bun.spawn(
    [process.execPath, `${import.meta.dir}/clock.ts`, ...(entry ? [entry] : [])],
    {
      env: { ...process.env, STOPHY_MCP_URL: url, STOPHY_API_KEY: "" },
      stdin: "pipe",
      stdout: "pipe",
      stderr: "inherit",
      ipc: () => clock.emit("advanced"),
    },
  );
  const output = createInterface({ input: Readable.fromWeb(child.stdout) });
  const lines = output[Symbol.asyncIterator]();
  const send = (
    message: Omit<JSONRPCRequest | JSONRPCNotification, "jsonrpc"> & { id?: number },
  ) => {
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);
    child.stdin.flush();
  };
  const next = async () => {
    const line = await lines.next();
    if (line.done) throw new Error("Bridge closed its output");
    return line.value;
  };
  const close = async () => {
    child.kill();
    output.close();
    await child.exited;
  };
  try {
    send({
      id: 0,
      method: "initialize",
      params: {
        protocolVersion: LATEST_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: { name: "fixture", version: "1" },
      },
    });
    const init = JSONRPCMessageSchema.parse(JSON.parse(await next()));
    if (!("result" in init)) throw new Error("Bridge initialization failed");
    send({ method: "notifications/initialized" });
  } catch (error) {
    await close();
    throw error;
  }
  return {
    call: (id: number, name: string, args: CallToolRequest["params"]["arguments"] = {}) =>
      send({ id, method: "tools/call", params: { name, arguments: args } }),
    cancel: (id: number) =>
      send({ method: "notifications/cancelled", params: { requestId: id, reason: "stop" } }),
    next,
    async advance(elapsed: number) {
      const advanced = once(clock, "advanced");
      child.send(elapsed);
      await advanced;
    },
    close,
  };
};
