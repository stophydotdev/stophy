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
