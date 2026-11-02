import { describe, expect, test } from "bun:test";
import { generateText, isStepCount } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { homeSearch, readPage, webSearch } from "../src/index";

const envelope = {
  success: true,
  data: {
    results: [{ title: "Bun", url: "https://bun.com", description: "A fast runtime", position: 1 }],
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
    expect(new URL(request?.url ?? "").pathname).toBe("/v1/web/search");
    expect(await request?.json()).toEqual({ query: "bun runtime", time: "pastWeek" });
    expect(request?.headers.get("authorization")).toBe("Bearer st_test");
  });

  test("each tool calls its own endpoint", async () => {
    const { requests, options } = fakeStophy();
    const call = { toolCallId: "call_1", messages: [], context: {} };

    await readPage(options).execute?.({ url: "https://bun.com/docs" }, call);
    await homeSearch(options).execute?.({ location: "Austin, TX" }, call);

    expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
      "/v1/web/scrape",
      "/v1/zillow/search",
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
