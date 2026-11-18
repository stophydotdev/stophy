import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
  expect(payloadOf({ success: true, data: { web: [] }, creditsUsed: 2 })).toEqual({ web: [] });
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
