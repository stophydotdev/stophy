import { describe, expect, test } from "bun:test";
import { generateText, isStepCount } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import {
  homeSearch,
  jobSearch,
  placeSearch,
  productSearch,
  readPage,
  redditSearch,
  webSearch,
} from "../src/index";

const envelope = {
  success: true,
  data: {
    web: [{ title: "Bun", url: "https://bun.com", description: "A fast runtime", position: 1 }],
    json: { results: [] },
  },
  creditsUsed: 1,
  requestId: "req_1",
};

function fakeStophy() {
  const requests: Request[] = [];
  const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push(new Request(input, init));
    return Response.json(envelope);
  };
  return { requests, options: { apiKey: "st_test", fetch, maxRetries: 0 } };
}

const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};

describe("Stophy tools", () => {
  test("send the input to the endpoint and return its data", async () => {
    const { requests, options } = fakeStophy();
    const controller = new AbortController();

    const data = await webSearch(options).execute?.(
      { query: "bun runtime", time: "pastWeek" },
      { toolCallId: "call_1", messages: [], abortSignal: controller.signal, context: {} },
    );

    expect(data).toEqual(envelope.data);
    const request = requests[0];
    expect(new URL(request?.url ?? "").pathname).toBe("/v1/search");
    expect(await request?.json()).toEqual({ query: "bun runtime", tbs: "qdr:w" });
    expect(request?.headers.get("authorization")).toBe("Bearer st_test");
  });

  test("each site tool reads its page with its parser", async () => {
    const { requests, options } = fakeStophy();
    const call = { toolCallId: "call_1", messages: [], context: {} };

    const page = await readPage(options).execute?.({ url: "https://bun.com/docs" }, call);
    const data = await redditSearch(options).execute?.(
      { query: "bun runtime", subreddit: "javascript", sort: "newest", time: "pastWeek" },
      call,
    );
    await placeSearch(options).execute?.({ query: "coffee", location: "Austin, TX" }, call);
    await productSearch(options).execute?.(
      { query: "earbuds", maxPrice: 50, sort: "priceLow" },
      call,
    );
    await jobSearch(options).execute?.({ query: "data analyst", remote: "remote" }, call);
    await homeSearch(options).execute?.({ location: "Austin, TX", minBedrooms: 3 }, call);

    expect(page).toMatchObject({ json: envelope.data.json });
    expect(data).toEqual(envelope.data.json);
    expect(requests.map((request) => new URL(request.url).pathname)).toEqual(
      Array.from({ length: 6 }, () => "/v1/scrape"),
    );
    const bodies = await Promise.all(requests.map((request) => request.json()));
    expect(bodies[0]).toEqual({ url: "https://bun.com/docs", formats: ["markdown"] });
    expect(bodies.slice(1)).toEqual([
      {
        url: "https://www.reddit.com/search/?q=bun+runtime&sort=new&t=week",
        formats: [{ type: "json", parser: "reddit-search", options: { subreddit: "javascript" } }],
      },
      {
        url: "https://www.google.com/maps/search/coffee%20in%20Austin%2C%20TX",
        formats: [{ type: "json", parser: "google-maps" }],
      },
      {
        url: "https://www.amazon.com/s?k=earbuds&high-price=50&s=price-asc-rank",
        formats: [{ type: "json", parser: "amazon-search" }],
      },
      {
        url: "https://www.indeed.com/jobs?q=data+analyst",
        formats: [{ type: "json", parser: "indeed-search", options: { remote: "remote" } }],
      },
      {
        url: "https://www.zillow.com/homes/Austin%2C-TX_rb/",
        formats: [{ type: "json", parser: "zillow-search", options: { minBedrooms: 3 } }],
      },
    ]);
  });

  test("run inside a generateText loop", async () => {
    const { requests, options } = fakeStophy();
    const model = new MockLanguageModelV4({
      doGenerate: [
        {
          content: [
            {
              type: "tool-call",
              toolCallId: "call_1",
              toolName: "webSearch",
              input: JSON.stringify({ query: "bun runtime" }),
            },
          ],
          finishReason: { unified: "tool-calls", raw: undefined },
          usage,
          warnings: [],
        },
        {
          content: [{ type: "text", text: "Bun is a fast runtime." }],
          finishReason: { unified: "stop", raw: undefined },
          usage,
          warnings: [],
        },
      ],
    });

    const result = await generateText({
      model,
      prompt: "What is Bun?",
      tools: { webSearch: webSearch(options) },
      stopWhen: isStepCount(2),
    });

    expect(result.text).toBe("Bun is a fast runtime.");
    expect(result.steps[0]?.toolResults[0]?.output).toEqual(envelope.data);
    expect(requests).toHaveLength(1);
  });
});
