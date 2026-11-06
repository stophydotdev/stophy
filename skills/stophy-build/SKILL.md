---
name: stophy-build
description: |
  Add Stophy to an app or a script: install the TypeScript or Python SDK, or call the REST API, and handle the key, errors and paging. Use for "add web scraping to my app", "call Stophy from my code", "use the Stophy SDK", "which Stophy endpoint should my backend call". For code that scrapes pages or site data, see stophy-build-scrape; for code that searches, stophy-build-search. To get data yourself now, without writing code, use stophy-scrape or stophy-search.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy build

Wire Stophy into the user's code.

## Install

```bash
npm install stophy   # TypeScript, 2.0.0 or later
pip install stophy   # Python, 2.0.0 or later
```

## The key

Both SDKs read `STOPHY_API_KEY` from the environment. Without a key, `scrape`, `search`, `map`, `parse` and the parsers marked "no key" work, 10 calls a minute and 50 a day. Get a key at https://stophy.dev/signup and keep it in the app's secret store, never in code or a commit.

## First call

```ts
import { Stophy } from "stophy";

const stophy = new Stophy();

const page = await stophy.scrape({ url: "https://example.com", formats: ["markdown"] });
console.log(page.data.markdown);
```

```python
from stophy import Stophy

stophy = Stophy()

page = stophy.scrape(url="https://example.com", formats=["markdown"])
print(page["data"]["markdown"])
```

```bash
curl https://api.stophy.dev/v1/scrape \
  -H "Authorization: Bearer $STOPHY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}'
```

Every call returns the API's JSON as is: `{ success, data }`. The SDKs throw a `StophyError` with the API's `code` and message.

**Done when:** you ran the user's code against the API, saw real data come back, and the key is read from the environment.

## Pick the call

| The app needs | Call |
|---|---|
| a page's text or fields | `scrape`, see [stophy-build-scrape](../stophy-build-scrape/SKILL.md) |
| a site's own data (Reddit, Amazon, Maps...) | `parsed(parser, pageUrl)`, see [stophy-build-scrape](../stophy-build-scrape/SKILL.md) |
| results for a query | `search`, see [stophy-build-search](../stophy-build-search/SKILL.md) |
| a site's pages | `map`, then `crawl` with `crawl.status`, or `batch.scrape` |
| fields from up to 10 pages | `extract` |
| a document's text | `parse` |

`GET https://api.stophy.dev/v1/endpoints` lists every endpoint with its input and price, and `GET /v1/parsers` every parser.

## Errors to handle

- `apiKeyRequired` and `freeLimit`: the call needs a key, or the free calls ran out.
- `insufficientCredits`: top up at https://stophy.dev/billing. Nothing was charged.
- `rateLimited`, `sourceTimeout`, `sourceUnavailable`: retry once after `retryAfterSeconds`.
- `invalidRequest`: the message names the field to fix. Do not retry unchanged.

A call that fails costs nothing. Log the `requestId` from `--raw` or the response for support.

## See also

- [stophy-build-scrape](../stophy-build-scrape/SKILL.md) and [stophy-build-search](../stophy-build-search/SKILL.md)
- [stophy](../stophy/SKILL.md): prices and the MCP server
