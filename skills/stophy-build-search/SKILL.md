---
name: stophy-build-search
description: |
  Write code that searches the web, news and images with Stophy, optionally with each result's page text, for agents, RAG and research features. Use for "add web search to my agent", "ground my LLM answers in search results", "get news about a company from my backend". For code that reads pages or site data, use stophy-build-scrape. To search yourself now, use stophy-search.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy build search

Search the web from the user's code.

**Prerequisite:** the SDK set up as in [stophy-build](../stophy-build/SKILL.md).

## Search

```ts
import { Stophy } from "stophy";

const stophy = new Stophy();

const results = await stophy.search({ query: "bun sqlite", limit: 3 });
console.log(results.data?.web?.map((result) => result.url));
```

```python
from stophy import Stophy

stophy = Stophy()

results = stophy.search(query="bun sqlite", limit=3)
print([result["url"] for result in results["data"]["web"]])
```

```bash
curl https://api.stophy.dev/v1/search \
  -H "Authorization: Bearer $STOPHY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"bun sqlite","limit":3}'
```

## News, and results with their text

```ts
const news = await stophy.search({ query: "nvidia", sources: ["news"], tbs: "qdr:w", limit: 5 });
console.log(news.data?.news?.map((item) => item.title));

const grounded = await stophy.search({ query: "bun sqlite", limit: 2, scrapeOptions: { formats: ["markdown"] } });
console.log(grounded.data?.web?.map((result) => result.markdown?.slice(0, 200)));
```

Results are grouped by source in `data.web`, `data.news` and `data.images`.

**Done when:** the code ran against the API and printed real results.

## Tips

- `sources` takes `web`, `news` and `images`. `tbs` filters by time, like `qdr:w`. `categories` takes `research`, `pdf`, `developer` and `gov`. `includeDomains` keeps up to 10 sites.
- With `scrapeOptions`, each web result carries its page text, so an LLM can quote it without a second call.
- A search costs 2 credits per 10 results from each source. With `scrapeOptions`, each web result with its text adds 1 credit.

## See also

- [stophy-build](../stophy-build/SKILL.md): install, key and errors
- [stophy-build-scrape](../stophy-build-scrape/SKILL.md): read the pages a search found
