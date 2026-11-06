---
name: stophy-build-scrape
description: |
  Write code that reads pages and site data with Stophy: a page as markdown or fields, a site's own data through a parser, paging, and crawls. Use for "scrape this site in my app", "get Reddit posts from my backend", "pull Amazon prices on a schedule", "crawl docs into my RAG pipeline". For search in code, use stophy-build-search. To read a page yourself now, use stophy-scrape.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy build scrape

Read pages and site data from the user's code.

**Prerequisite:** the SDK set up as in [stophy-build](../stophy-build/SKILL.md).

## A page

```ts
import { Stophy } from "stophy";

const stophy = new Stophy();

const page = await stophy.scrape({ url: "https://example.com", formats: ["markdown"] });
console.log(page.data.markdown);
```

## A site's own data

Send the page a person would open, and the parser that reads it. `stophy parsers` or `GET /v1/parsers` lists them.

```ts
const videos = await stophy.parsed("youtube-search", "https://www.youtube.com/results?search_query=lofi+beats");
console.log(videos.data.json);
```

```python
from stophy import Stophy

stophy = Stophy()

videos = stophy.parsed("youtube-search", "https://www.youtube.com/results?search_query=lofi+beats")
print(videos["data"]["json"]["results"])
```

```bash
curl https://api.stophy.dev/v1/scrape \
  -H "Authorization: Bearer $STOPHY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.reddit.com/search/?q=bun+vs+node","formats":[{"type":"json","parser":"reddit-search"}]}'
```

The parser's output is in `data.json`. Lists are in `data.json.results`. When `cursor` is set, send it back as an option for the next page: `parsed(parser, url, { cursor })` in TypeScript, `parsed(parser, url, cursor=cursor)` in Python. Paging needs a key.

## Many pages

```ts
const job = await stophy.crawl({ url: "https://bun.com/docs", limit: 3 });
if (job.id) {
  let status = await stophy.crawl.status({ id: job.id });
  while (status.status === "scraping") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    status = await stophy.crawl.status({ id: job.id });
  }
  console.log(status.data?.map((page) => page.metadata?.sourceURL));
}
```

**Done when:** the code ran against the API and printed real pages or results.

## Tips

- Parser option names are camelCase, as `/v1/parsers` lists them, in both SDKs.
- `scrape` with `maxAge` accepts a stored copy up to that many milliseconds old for free.
- A scrape or a parser call costs 1 credit; a crawl 1 credit a page.

## See also

- [stophy-build](../stophy-build/SKILL.md): install, key and errors
- [stophy-build-search](../stophy-build-search/SKILL.md): search in code
