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

test("a body without data drops creditsUsed and keeps costUsd", () => {
  expect(
    payloadOf({ success: true, links: [], creditsUsed: 0, costUsd: 0, requestId: "r" }),
  ).toEqual({ links: [], costUsd: 0, requestId: "r" });
  expect(
    payloadOf({ success: true, id: "c1", url: "https://a.test", creditsUsed: 1, costUsd: 0.001 }),
  ).toEqual({ id: "c1", url: "https://a.test", costUsd: 0.001 });
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

async function runAgent(args: string[], apiKey = "st_test") {
  const home = mkdtempSync(join(tmpdir(), "stophy-cli-agent-"));
  const calls: unknown[] = [];
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(req) {
      const { pathname, search } = new URL(req.url);
      calls.push([req.method, `${pathname}${search}`, await req.text()]);
      if (req.method === "POST") return Response.json({ id: "job_new", status: "processing" });
      if (pathname === "/v1/agent") return Response.json({ agents: [], next: null });
      return Response.json({
        id: "job_1",
        status: req.method === "DELETE" ? "cancelled" : "completed",
      });
    },
  });
  try {
    const agent = {
      ...endpoint("agent"),
      keyless: false,
      input: {
        type: "object",
        properties: { prompt: { type: "string", minLength: 1 } },
        required: ["prompt"],
      },
    };
    mkdirSync(join(home, "stophy"));
    writeFileSync(
      join(home, "stophy", "catalog.json"),
      JSON.stringify({ fetchedAt: new Date().toISOString(), endpoints: [agent] }),
    );
    const run = Bun.spawn(["bun", "src/index.ts", "agent", ...args], {
      env: {
        ...process.env,
        XDG_CONFIG_HOME: home,
        STOPHY_API_KEY: apiKey,
        STOPHY_BASE_URL: `http://127.0.0.1:${server.port}`,
        STOPHY_NO_UPDATE_CHECK: "1",
      },
      stderr: "pipe",
      stdout: "pipe",
    });
    const [exit, out, err] = await Promise.all([
      run.exited,
      new Response(run.stdout).text(),
      new Response(run.stderr).text(),
    ]);
    return { exit, out, err, calls };
  } finally {
    server.stop(true);
    rmSync(home, { recursive: true, force: true });
  }
}

test.each([
  { args: ["list"], method: "GET", path: "/v1/agent", answer: { agents: [], next: null } },
  {
    args: ["list", "--before", "1700000000000", "--limit", "2"],
    method: "GET",
    path: "/v1/agent?before=1700000000000&limit=2",
    answer: { agents: [], next: null },
  },
  {
    args: ["status", "job_1"],
    method: "GET",
    path: "/v1/agent/job_1",
    answer: { id: "job_1", status: "completed" },
  },
  {
    args: ["cancel", "--id", "job_1"],
    method: "DELETE",
    path: "/v1/agent/job_1",
    answer: { id: "job_1", status: "cancelled" },
  },
])("agent $args sends one $method to $path", async ({ args, method, path, answer }) => {
  const { exit, out, calls } = await runAgent(args);
  expect(calls).toEqual([[method, path, ""]]);
  expect(exit).toBe(0);
  expect(JSON.parse(out)).toEqual(answer);
});

test.each(
  [
    ["--", "list", "--limit", "1", "--json"],
    ["--", "list", "--before", "1767398400000", "--json"],
    ["--", "list", "--output", "agent", "list", "--limit", "1", "--json"],
  ].map((args) => ({ args })),
)("agent $args rejects a misplaced separator without contacting the API", async ({ args }) => {
  const { exit, out, calls } = await runAgent(args);
  expect(calls).toEqual([]);
  expect(exit).toBe(1);
  expect(out).toContain("Use `stophy agent list` without a separator before the subcommand.");
});

test.each(["status", "cancel"])(
  "agent %s without an ID fails before signup or a run",
  async (verb) => {
    const { exit, out, calls } = await runAgent([verb], "");
    expect(calls).toEqual([]);
    expect(exit).toBe(1);
    expect(out).toContain("Missing required flag --id.");
  },
);

test.each(["list", "status", "cancel"])(
  "agent --prompt %s starts an explicit prompt",
  async (prompt) => {
    const { exit, out, calls } = await runAgent(["--prompt", prompt]);
    expect(calls).toEqual([["POST", "/v1/agent", JSON.stringify({ prompt })]]);
    expect(exit).toBe(0);
    expect(JSON.parse(out)).toEqual({ id: "job_new", status: "processing" });
  },
);

test("an option before an agent control verb cannot turn it into a prompt", async () => {
  const { exit, out, calls } = await runAgent(["--json", "list"]);
  expect(calls).toEqual([]);
  expect(exit).toBe(1);
  expect(out).toContain("--prompt");
});

test("agent help lists its lifecycle commands and shows where the ID goes", async () => {
  const help = await runAgent(["--help"]);
  expect(help.exit).toBe(0);
  expect(help.calls).toEqual([]);
  expect(help.out).toMatch(/Commands:\s+list\s+[^\n]+\s+status\s+[^\n]+\s+cancel\s+/u);
  const status = await runAgent(["status", "--help"]);
  expect(status.exit).toBe(0);
  expect(status.calls).toEqual([]);
  expect(status.out).toContain("Usage: stophy agent status <id> [options]");
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

const helpWith = async (ids: readonly string[]) => {
  const home = `/tmp/stophy-cli-help-${ids.length}-${process.pid}`;
  mkdirSync(`${home}/stophy`, { recursive: true });
  const catalog = { fetchedAt: new Date().toISOString(), endpoints: ids.map(endpoint) };
  writeFileSync(`${home}/stophy/catalog.json`, JSON.stringify(catalog));
  const run = Bun.spawn(["bun", "src/index.ts", "--help"], {
    env: { ...process.env, XDG_CONFIG_HOME: home, STOPHY_NO_UPDATE_CHECK: "1" },
    stdout: "pipe",
  });
  return new Response(run.stdout).text();
};

test("the command list shows how to run code in a browser when the API has one", async () => {
  expect(await helpWith(["search", "browser.task"])).toContain(
    `$ stophy browser run --url https://example.com --code "return await page.title()"`,
  );
  expect(await helpWith(["search"])).not.toContain("browser run");
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

const priced = () =>
  Response.json({
    success: true,
    data: { web: [] },
    creditsUsed: 1,
    costUsd: 0.001,
    requestId: "r",
  });

test("--raw prints the body exactly as the API sent it", async () => {
  const { out } = await runAgainst(priced, ["search", "bun", "--raw"]);
  expect(JSON.parse(out)).toEqual({
    success: true,
    data: { web: [] },
    creditsUsed: 1,
    costUsd: 0.001,
    requestId: "r",
  });
});

test("the one-line agent output keeps costUsd and drops creditsUsed", async () => {
  const { out } = await runAgainst(priced, ["search", "bun"]);
  expect(JSON.parse(out)).toEqual({
    success: true,
    data: { web: [] },
    costUsd: 0.001,
    requestId: "r",
  });
});
