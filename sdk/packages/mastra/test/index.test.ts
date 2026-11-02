import { describe, expect, test } from "bun:test";
import { homeSearchTool, stophyTools, webSearchTool } from "../src/index";

const envelope = {
  success: true,
  data: {
    results: [{ title: "Bun", url: "https://bun.com", description: "A runtime", position: 1 }],
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

describe("Stophy tools for Mastra", () => {
  test("send the input to the endpoint and return its data", async () => {
    const { requests, options } = fakeStophy();

    const data = await webSearchTool(options).execute?.(
      { query: "bun runtime", time: "pastWeek" },
      { abortSignal: new AbortController().signal },
    );

    expect(data).toEqual(envelope.data);
    const request = requests[0];
    expect(new URL(request?.url ?? "").pathname).toBe("/v1/web/search");
    expect(await request?.json()).toEqual({ query: "bun runtime", time: "pastWeek" });
    expect(request?.headers.get("authorization")).toBe("Bearer st_test");
  });

  test("give every tool its own id", () => {
    expect(Object.values(stophyTools()).map((tool) => tool.id)).toEqual([
      "stophy-web-search",
      "stophy-read-page",
      "stophy-reddit-search",
      "stophy-place-search",
      "stophy-product-search",
      "stophy-job-search",
      "stophy-home-search",
    ]);
  });

  test("refuse input that breaks the schema before calling Stophy", async () => {
    const { requests, options } = fakeStophy();

    const answer = await homeSearchTool(options).execute?.({ location: "" }, {});

    expect(requests).toHaveLength(0);
    expect(JSON.stringify(answer)).toContain("location");
  });
});
