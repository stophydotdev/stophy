---
name: stophy-build
description: Use to add Stophy to an app or script, like "add web search to my agent", "scrape this site from my backend" or "crawl docs into my RAG pipeline". Covers the TypeScript and Python SDKs, REST, keys, paging and errors.
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy build

To get data yourself now, without writing code, use [stophy](../stophy/SKILL.md).

## Install and key

```bash
npm install stophy
pip install stophy
```

Both SDKs read `STOPHY_API_KEY`. Keep the key in the app's secret store, never in code. Get one at https://stophy.dev/signup. Without a key, `scrape`, `search`, `map`, `parse` and the keyless parsers work for 10 calls a minute and 50 a day.

## Calls

```ts
import { Stophy } from "stophy";

const stophy = new Stophy();

const page = await stophy.scrape({ url: "https://example.com", formats: ["markdown"] });
console.log(page.data?.markdown);

const results = await stophy.search({ query: "bun sqlite", limit: 3 });
console.log(results.data?.web?.map((result) => result.url));

const videos = await stophy.parsed("youtube-search", "https://www.youtube.com/results?search_query=lofi+beats");
console.log(videos.data?.json);

const { id } = await stophy.crawl({ url: "https://bun.com/docs/bundler", limit: 3 });
if (id === undefined) throw new Error("The crawl did not start");
let crawl = await stophy.crawl.status({ id });
while (crawl.status === "scraping") {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  crawl = await stophy.crawl.status({ id });
}
console.log(crawl.data?.map((crawled) => crawled.metadata?.sourceURL));
```

```python
from stophy import Stophy

stophy = Stophy()

page = stophy.scrape(url="https://example.com", formats=["markdown"])
print(page["data"]["markdown"])

videos = stophy.parsed("youtube-search", "https://www.youtube.com/results?search_query=lofi+beats")
print(videos["data"]["json"]["results"][0]["title"])
```

```bash
curl https://api.stophy.dev/v1/search \
  -H "Authorization: Bearer $STOPHY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"bun sqlite","limit":3}'
```

| The app needs | Call |
|---|---|
| a page's text or fields | `scrape`, with a json format for fields |
| a site's own data | `parsed(parser, pageUrl)`. `GET /v1/parsers` lists the parsers |
| results for a query | `search`, with `sources`, `tbs`, `categories` and `scrapeOptions` for page text |
| a site's pages | `map`, then `crawl` and `crawl.status`, or `batch.scrape` |
| fields from up to 25 pages | `extract` |
| a document's text | `parse` |

`GET https://api.stophy.dev/v1/endpoints` lists every endpoint with its input and price.

## Paging and errors

- A parser list returns `cursor` when there is more. Send it back: `parsed(parser, url, { cursor })` in TypeScript, `parsed(parser, url, cursor=cursor)` in Python. Paging needs a key.
- A failed call throws `StophyError` with the API's `code` and `retryable`. When `retryable` is true, retry once after `retryAfterSeconds`. On `invalidRequest`, fix the field the message names. On `insufficientCredits`, top up at https://stophy.dev/billing. A failed call costs nothing.

**Done when:** the user's code ran against the API, printed real data, and reads the key from the environment.
