import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";
import type { CatalogEndpoint } from "../src/catalog.ts";
import { payloadOf } from "../src/invoke.ts";
import { requestFor, withJobEndpoints } from "../src/jobs.ts";
import { withParserFlags } from "../src/parsers.ts";
import { renderData } from "../src/render.ts";

const endpoint = (id: string): CatalogEndpoint => ({
  id,
  method: "POST",
  path: `/v1/${id.replaceAll(".", "/")}`,
  keyless: true,
  input: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
});

test("a lone data is unwrapped, other bodies keep their fields", () => {
  expect(payloadOf({ success: true, data: { markdown: "hi" } })).toEqual({ markdown: "hi" });
  expect(payloadOf({ success: true, data: { web: [] }, costUsd: 0.002 })).toEqual({ web: [] });
  expect(payloadOf({ success: true, links: [{ url: "https://a.test" }] })).toEqual({
    links: [{ url: "https://a.test" }],
  });
  expect(payloadOf({ status: "cancelled" })).toEqual({ status: "cancelled" });
});

test("--parser and --parserOptions become a json format on scrape", () => {
  const [scrape] = withParserFlags([endpoint("scrape")]);
  expect(scrape?.input.properties).toHaveProperty("parser");
  const call = requestFor(endpoint("scrape"), {
    url: "https://www.reddit.com/r/rust/",
    parser: "reddit-subreddit",
    parserOptions: { cursor: "abc" },
  });
  expect(call.body).toEqual({
    url: "https://www.reddit.com/r/rust/",
    formats: [{ type: "json", parser: "reddit-subreddit", options: { cursor: "abc" } }],
  });
});

test("job commands join the catalog under their parent and send the id in the path", () => {
  const ids = withJobEndpoints([endpoint("crawl"), endpoint("scrape")]).map((job) => job.id);
  expect(ids).toEqual(["crawl", "scrape", "crawl.status", "crawl.cancel"]);
  const status = withJobEndpoints([endpoint("crawl")]).find((job) => job.id === "crawl.status");
  if (!status) throw new Error("crawl.status missing");
  expect(requestFor(status, { id: "job_1", cursor: "c2" })).toEqual({
    method: "GET",
    path: "/v1/crawl/job_1",
    params: { cursor: "c2" },
  });
});

test("crawled pages print their title and link from metadata", () => {
  const text = renderData({
    data: [{ markdown: "# Bun", metadata: { title: "Bun", url: "https://bun.com/" } }],
  });
  expect(text).toBe("data:\n1. Bun\n   https://bun.com/");
});

test("a site command from before v1 points to search and parsers", async () => {
  const home = `/tmp/stophy-cli-v1-${process.pid}`;
  mkdirSync(`${home}/stophy`, { recursive: true });
  const catalog = { fetchedAt: new Date().toISOString(), endpoints: [endpoint("search")] };
  writeFileSync(`${home}/stophy/catalog.json`, JSON.stringify(catalog));
  const run = Bun.spawn(["bun", "src/index.ts", "google", "search", "bun"], {
    env: { ...process.env, XDG_CONFIG_HOME: home, STOPHY_NO_UPDATE_CHECK: "1" },
    stderr: "pipe",
    stdout: "pipe",
  });
  const error = `${await new Response(run.stderr).text()}${await new Response(run.stdout).text()}`;
  expect(await run.exited).toBe(1);
  expect(error).toContain("stophy parsers google");
  expect(error).not.toContain("too many arguments");
});

test("Agent controls use their own routes and never start a paid run", async () => {
  const home = mkdtempSync(join(tmpdir(), "stophy-cli-agent-"));
  mkdirSync(join(home, "stophy"));
  const agent = {
    ...endpoint("agent"),
    keyless: false,
    input: {
      type: "object",
      properties: { prompt: { type: "string" } },
      required: ["prompt"],
    },
  };
  writeFileSync(
    join(home, "stophy", "catalog.json"),
    JSON.stringify({
      fetchedAt: new Date().toISOString(),
      endpoints: [agent],
    }),
  );
  const seen: string[] = [];
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      const { pathname, search } = new URL(request.url);
      const body = request.method === "POST" ? ` ${await request.text()}` : "";
      seen.push(`${request.method} ${pathname}${search}${body}`);
      return Response.json({ success: true });
    },
  });
  const invoke = async (args: readonly string[], apiKey = `st_${"a".repeat(40)}`) => {
    const run = Bun.spawn([process.execPath, "src/index.ts", "agent", ...args], {
      env: {
        ...process.env,
        XDG_CONFIG_HOME: home,
        STOPHY_API_KEY: apiKey,
        STOPHY_BASE_URL: server.url.origin,
        STOPHY_NO_UPDATE_CHECK: "1",
      },
      stderr: "pipe",
      stdout: "pipe",
    });
    const [exit, stdout, stderr] = await Promise.all([
      run.exited,
      new Response(run.stdout).text(),
      new Response(run.stderr).text(),
    ]);
    return { exit, stdout, stderr, requests: seen.splice(0) };
  };
  try {
    const list = await invoke(["list"]);
    const page = await invoke(["list", "--before", "123", "--limit", "2"]);
    const status = await invoke(["status", "run/1"]);
    const cancel = await invoke(["cancel", "--id", "run/1"]);
    const start = await invoke(["--prompt", "list"]);
    const misplaced = await invoke(["--json", "list"]);
    const missingStatus = await invoke(["status"], "");
    const missingCancel = await invoke(["cancel"], "");
    const help = await invoke(["--help"]);
    expect(
      [list, page, status, cancel, start, misplaced, missingStatus, missingCancel, help].map(
        ({ exit, requests }) => [exit, requests],
      ),
    ).toEqual([
      [0, ["GET /v1/agent"]],
      [0, ["GET /v1/agent?before=123&limit=2"]],
      [0, ["GET /v1/agent/run%2F1"]],
      [0, ["DELETE /v1/agent/run%2F1"]],
      [0, ['POST /v1/agent {"prompt":"list"}']],
      [1, []],
      [1, []],
      [1, []],
      [0, []],
    ]);
    expect(`${misplaced.stdout}${misplaced.stderr}`).toContain(
      "Put `list` right after `stophy agent`",
    );
    expect(`${missingStatus.stdout}${missingStatus.stderr}`).toContain(
      "Missing required flag --id.",
    );
    expect(`${missingCancel.stdout}${missingCancel.stderr}`).toContain(
      "Missing required flag --id.",
    );
    expect(help.stdout).toContain("List your Agent runs");
    expect(help.stdout).toContain("Check an Agent run");
    expect(help.stdout).toContain("Stop an Agent run");
  } finally {
    await server.stop(true);
    rmSync(home, { recursive: true });
  }
});

const firstCommand = () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  const line = readme.split("\n").find((text) => text.startsWith("npx -y @stophy/cli "));
  if (line === undefined) throw new Error("README has no first CLI command");
  return line.replace("npx -y @stophy/cli ", "").match(/"[^"]*"|\S+/gu) ?? [];
};

test("the first command in the README runs and sends one search with two results", async () => {
  const home = `/tmp/stophy-cli-readme-${process.pid}`;
  mkdirSync(`${home}/stophy`, { recursive: true });
  const search = {
    id: "search",
    method: "POST",
    path: "/v1/search",
    keyless: true,
    input: {
      type: "object",
      properties: { query: { type: "string" }, limit: { type: "integer" } },
      required: ["query"],
    },
  };
  const catalog = { fetchedAt: new Date().toISOString(), endpoints: [search] };
  writeFileSync(`${home}/stophy/catalog.json`, JSON.stringify(catalog));
  const bodies: unknown[] = [];
  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      bodies.push(await req.json());
      return Response.json({ success: true, data: { web: [] } });
    },
  });
  const run = Bun.spawn(
    ["bun", "src/index.ts", ...firstCommand().map((arg) => arg.replaceAll('"', ""))],
    {
      env: {
        ...process.env,
        XDG_CONFIG_HOME: home,
        STOPHY_BASE_URL: `http://127.0.0.1:${server.port}`,
        STOPHY_NO_UPDATE_CHECK: "1",
      },
      stderr: "pipe",
      stdout: "pipe",
    },
  );
  const exit = await run.exited;
  server.stop(true);
  expect(await new Response(run.stderr).text()).toBe("");
  expect(exit).toBe(0);
  expect(bodies).toEqual([{ query: "bun runtime", limit: 2 }]);
});

const runAgainst = async (answer: (path: string) => Response, args: string[]) => {
  const home = `/tmp/stophy-cli-dollars-${process.pid}`;
  mkdirSync(`${home}/stophy`, { recursive: true });
  const search = {
    id: "search",
    method: "POST",
    path: "/v1/search",
    keyless: true,
    input: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  };
  writeFileSync(
    `${home}/stophy/catalog.json`,
    JSON.stringify({ fetchedAt: new Date().toISOString(), endpoints: [search] }),
  );
  const server = Bun.serve({ port: 0, fetch: (req) => answer(new URL(req.url).pathname) });
  const run = Bun.spawn(["bun", "src/index.ts", ...args], {
    env: {
      ...process.env,
      XDG_CONFIG_HOME: home,
      STOPHY_API_KEY: "st_test",
      STOPHY_BASE_URL: `http://127.0.0.1:${server.port}`,
      STOPHY_NO_UPDATE_CHECK: "1",
    },
    stderr: "pipe",
    stdout: "pipe",
  });
  await run.exited;
  server.stop(true);
  return {
    out: await new Response(run.stdout).text(),
    err: await new Response(run.stderr).text(),
  };
};

const account = (path: string) =>
  path === "/v1/usage"
    ? Response.json({ balanceUsd: 1.9876, costUsd: 0.0124, requestCount: 12 })
    : Response.json({ success: true, data: { balanceUsd: 1.9876 } });

test("usage shows the balance and the spend in dollars", async () => {
  const { out } = await runAgainst(account, ["usage"]);
  expect(out).toBe("balance: $1.9876\nspent (all time): $0.0124\nrequests (all time): 12\n");
});

test("usage --json carries balanceUsd and costUsd", async () => {
  const { out } = await runAgainst(account, ["usage", "--json"]);
  expect(JSON.parse(out)).toEqual({ balanceUsd: 1.9876, costUsd: 0.0124, requestCount: 12 });
});

test("doctor shows the balance in dollars", async () => {
  const { out } = await runAgainst(account, ["doctor"]);
  expect(out).toContain("Balance");
  expect(out).toContain("$1.9876 left");
  expect(out.toLowerCase()).not.toContain("credit");
});

test("a --json call prints what it cost, in dollars, on stderr", async () => {
  const { err } = await runAgainst(
    () =>
      Response.json(
        { success: true, data: { web: [] }, costUsd: 0.001 },
        { headers: { "x-cost-usd": "0.001" } },
      ),
    ["search", "bun", "--json"],
  );
  expect(err).toBe("cost: $0.001\n");
});
