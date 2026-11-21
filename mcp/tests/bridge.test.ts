import { expect, test } from "bun:test";
import { ErrorCode, JSONRPCMessageSchema } from "@modelcontextprotocol/sdk/types.js";
import { startBridge, startHosted } from "./fixture";

const result = { content: [{ type: "text" as const, text: "finished" }] };

test("canceling one stdio call disconnects only its upstream request", async () => {
  const hosted = startHosted();
  const bridge = await startBridge(hosted.url);
  try {
    bridge.call(1, "stophy_scrape", { url: "https://example.com/first" });
    const first = await hosted.next();
    bridge.call(2, "stophy_scrape", { url: "https://example.com/second" });
    const second = await hosted.next();
    bridge.cancel(1);
    expect(await hosted.nextCancellation()).toMatchObject({
      params: { requestId: first.message.id },
    });
    await expect(first.disconnected).resolves.toBe("disconnected");
    second.reply(result);
    expect(JSON.parse(await bridge.next())).toEqual({ jsonrpc: "2.0", id: 2, result });
  } finally {
    await bridge.close();
    hosted.close();
  }
});

test("tool deadlines let valid work finish and cut off overdue requests", async () => {
  const hosted = startHosted();
  const bridge = await startBridge(hosted.url);
  try {
    const cases = [
      { name: "stophy_scrape", args: { url: "https://example.com" }, deadline: 65_000 },
      { name: "stophy_search", args: { query: "local", timeout: 200_000 }, deadline: 125_000 },
      {
        name: "stophy_search",
        args: { query: "local", scrapeOptions: { formats: ["markdown"] } },
        deadline: 65_000,
      },
      {
        name: "stophy_extract",
        args: { urls: ["https://example.com"], prompt: "Find the title", timeout: 300_000 },
        deadline: 299_000,
      },
      {
        name: "stophy_map",
        args: { url: "https://example.com", timeout: 400_000 },
        deadline: 299_000,
      },
      {
        name: "browserRun",
        args: { id: "session", prompt: "Read the page", timeout: 180 },
        deadline: 185_000,
      },
      { name: "browserRun", args: { id: "session", prompt: "Read the page" }, deadline: 125_000 },
      {
        name: "stophy_browser_run",
        args: { id: "session", prompt: "Read the page" },
        deadline: 125_000,
      },
      {
        name: "stophy_parse",
        args: { url: "https://example.com/file.pdf", timeout: 200_000 },
        deadline: 65_000,
      },
    ];
    let id = 1;
    for (const { name, args, deadline } of cases) {
      bridge.call(id, name, args);
      const inTime = await hosted.next();
      bridge.call(id + 1, name, args);
      const overdue = await hosted.next();
      await bridge.advance(deadline - 1);
      inTime.reply(result);
      expect(JSON.parse(await bridge.next())).toEqual({ jsonrpc: "2.0", id, result });
      await bridge.advance(1);
      const failure = JSONRPCMessageSchema.parse(JSON.parse(await bridge.next()));
      expect(failure).toMatchObject({ id: id + 1, error: { code: ErrorCode.RequestTimeout } });
      await expect(overdue.disconnected).resolves.toBe("disconnected");
      id += 2;
    }
  } finally {
    await bridge.close();
    hosted.close();
  }
});
