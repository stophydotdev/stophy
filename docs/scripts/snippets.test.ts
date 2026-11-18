import { expect, test } from "bun:test";
import { curlSnippet, pythonSnippet, tsSnippet } from "./snippets";

test("a scrape call becomes one SDK call with snake_case arguments in Python", () => {
  const call = { method: "POST", path: "/v1/scrape", body: { url: "https://example.com", onlyMainContent: true } };
  expect(tsSnippet(call, true)).toBe(
    [
      "```typescript TypeScript",
      'import { Stophy } from "stophy";',
      "",
      "const stophy = new Stophy();",
      "",
      'const result = await stophy.scrape({ url: "https://example.com", onlyMainContent: true });',
      "console.log(result);",
      "```",
    ].join("\n"),
  );
  expect(pythonSnippet(call, true)).toBe(
    [
      "```python Python",
      "from stophy import Stophy",
      "",
      "stophy = Stophy()",
      "",
      'result = stophy.scrape(url="https://example.com", only_main_content=True)',
      "print(result)",
      "```",
    ].join("\n"),
  );
});

test("a scrape of one parser the SDK lists becomes parsed, and an unlisted parser stays a scrape", () => {
  const read = (parser: string) => ({
    method: "POST",
    path: "/v1/scrape",
    body: { url: "https://example.com/page", formats: [{ type: "json", parser }] },
  });
  expect(tsSnippet(read("reddit-search"), true)).toContain('stophy.parsed("reddit-search", "https://example.com/page")');
  expect(pythonSnippet(read("reddit-search"), true)).toContain('stophy.parsed("reddit-search", "https://example.com/page")');
  expect(tsSnippet(read("not-a-parser"), true)).toContain("stophy.scrape(");
});

test("a job id in the path becomes an id argument, and a cursor in the query is kept", () => {
  const call = { method: "GET", path: "/v1/crawl/job_abc?cursor=xyz" };
  expect(tsSnippet(call, true)).toContain('stophy.crawl.status({ id: "job_abc", cursor: "xyz" })');
  expect(pythonSnippet(call, true)).toContain('stophy.crawl.status(id="job_abc", cursor="xyz")');
});

test("a call the SDK has no method for keeps fetch and requests", () => {
  const call = { method: "GET", path: "/v1/monitor" };
  expect(tsSnippet(call, true)).toContain('await fetch("https://api.stophy.dev/v1/monitor"');
  expect(pythonSnippet(call, true)).toContain('requests.get(');
});

test("a query the SDK method does not take keeps fetch and requests", () => {
  const call = { method: "GET", path: "/v1/logs?limit=3" };
  expect(tsSnippet(call, true)).toContain("await fetch(");
});

test("a cURL line whose URL has a query string quotes the URL", () => {
  const call = { method: "GET", path: "/v1/search/research/papers/W1/similar?intent=rag&k=5" };
  expect(curlSnippet(call, false)).toBe(
    ["```bash cURL", 'curl "https://api.stophy.dev/v1/search/research/papers/W1/similar?intent=rag&k=5"', "```"].join("\n"),
  );
});
