import { describe, expect, test } from "bun:test";
import { makeClient, queryOf, specOperations } from "./helpers";

const ok = { success: true, data: {}, creditsUsed: 1, requestId: "req_1" };

describe("v1 operations", () => {
  test("posts the input to the path from the spec", async () => {
    const { client, calls } = makeClient({ json: ok });
    await client.scrape({ url: "https://example.com", formats: ["markdown"] });
    await client.batch.scrape({ urls: ["https://example.com"] });
    expect(calls.map((call) => `${call.method} ${new URL(call.url).pathname}`)).toEqual([
      "POST /v1/scrape",
      "POST /v1/batch/scrape",
    ]);
    expect(calls[0]?.body).toEqual({ url: "https://example.com", formats: ["markdown"] });
    expect(calls[0]?.headers.get("accept")).toBe("application/json");
  });

  test("reads a page with a parser through scrape's json format", async () => {
    const { client, calls } = makeClient({ json: ok });
    await client.parsed("reddit-search", "https://www.reddit.com/search/?q=bun", { page: 2 });
    await client.parsed("reddit-search", "https://www.reddit.com/search/?q=bun");
    expect(new URL(calls[0]?.url ?? "").pathname).toBe("/v1/scrape");
    expect(calls[0]?.body).toEqual({
      url: "https://www.reddit.com/search/?q=bun",
      formats: [{ type: "json", parser: "reddit-search", options: { page: 2 } }],
    });
    expect(calls[1]?.body).toEqual({
      url: "https://www.reddit.com/search/?q=bun",
      formats: [{ type: "json", parser: "reddit-search" }],
    });
  });

  test("puts the id in the path and the rest in the query", async () => {
    const { client, calls } = makeClient({ json: { status: "cancelled" } });
    await client.crawl.cancel({ id: "job/1", maxTextLength: 100 });
    expect(calls[0]?.method).toBe("DELETE");
    expect(new URL(calls[0]?.url ?? "").pathname).toBe("/v1/crawl/job%2F1");
    expect(queryOf(calls[0]?.url ?? "")).toEqual({ maxTextLength: "100" });
    expect(calls[0]?.body).toBeUndefined();
  });

  test("sends GET query parameters and bare calls", async () => {
    const { client, calls } = makeClient({ json: ok });
    await client.logs({ days: 7, endpoint: "scrape" });
    await client.limits();
    await client.key.revoke();
    expect(calls.map((call) => `${call.method} ${new URL(call.url).pathname}`)).toEqual([
      "GET /v1/logs",
      "GET /v1/limits",
      "DELETE /v1/key",
    ]);
    expect(queryOf(calls[0]?.url ?? "")).toEqual({ days: "7", endpoint: "scrape" });
  });

  test("sends an empty body when every field is optional", async () => {
    const { client, calls } = makeClient({ json: ok });
    await client.signup();
    expect(calls[0]?.body).toEqual({});
  });

  test("forwards the abort signal", async () => {
    const { client, calls } = makeClient({ json: ok });
    const controller = new AbortController();
    controller.abort();
    await client.search({ query: "bun" }, { signal: controller.signal }).catch(() => undefined);
    expect(calls[0]?.signal?.aborted).toBe(true);
  });

  test("exposes every operation in the spec", async () => {
    const { client, calls } = makeClient({ json: ok });
    const id = "x";
    await client.endpoints();
    await client.parsers();
    await client.limits();
    await client.usage();
    await client.logs();
    await client.key.revoke();
    await client.signup();
    await client.signup.poll({ code: id });
    await client.search({ query: "bun" });
    await client.scrape({ url: "https://example.com" });
    await client.map({ url: "https://example.com" });
    await client.parse({ file: "JVBERi0=" });
    await client.extract({ urls: ["https://example.com"] });
    await client.extract.result({ id });
    await client.crawl({ url: "https://example.com" });
    await client.crawl.status({ id, cursor: "next" });
    await client.crawl.cancel({ id });
    await client.batch.scrape({ urls: ["https://example.com"] });
    await client.batch.scrape.status({ id });
    await client.batch.scrape.cancel({ id });
    await client.browser.task({ url: "https://example.com", goal: "Read the title" });
    await client.browser.task.status({ id });
    const called = new Set(calls.map((call) => `${call.method} ${new URL(call.url).pathname}`));
    expect([...called].sort()).toEqual(await specOperations());
  });
});
