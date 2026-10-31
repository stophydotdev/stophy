---
name: stophy-web
description: |
  Search the web with Google: ranked pages, news, images, videos, scholarly papers, patents, autocomplete and search trends. Use for "search the web for", "find pages about", "find sources on", "latest news about", "find papers on", "what is trending on Google". Google search and Google News work without an API key. For posts on social platforms use stophy-social. For ad libraries use stophy-ads.
metadata:
  author: stophy
  version: "4.0.6"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy web

Search the web for pages, news, papers and trends on a topic.

**Prerequisite:** `google search`, `web search`, `web news`, `web images`, `web scrape`, `web parse`, `web map`, `google news`, `google images`, `google suggest` and `google patents` work without a key, within a free limit. Every other command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no login needed: find pages and sources on a topic
stophy google search "postgres 18 release notes" --json -o .stophy/search.json

# the next page of results
stophy google search "postgres 18 release notes" --page 2 --json -o .stophy/search-2.json

# recent news, newest first
stophy google news "nvidia" --sort newest --json -o .stophy/news.json

# papers, and the works that cite one
stophy google scholar "malaria vaccine efficacy" --sort newest --json -o .stophy/scholar.json
stophy google scholar --citesId 12345678901234567 --json

# what people search for
stophy google trends trending --country us --json
stophy google trends related bitcoin --json

# pages in one language, published in a date range
stophy web search "postgres 18" --language en --after 2026-01-01 --before 2026-10-27 --json -o .stophy/dated.json

# read several pages in one call
stophy web scrape --urls https://example.com,https://example.org --json -o .stophy/pages.json
```

Narrow a search with `--time`, `--country` and `--language`. Run `stophy google search --help` for every option. Run `stophy google --help` for every Google command.

**Done when:** you report each result with its source URL or domain, and every claim matches the saved output.

## Tips

- Search first, then open the pages that matter. Quote the result's `url`.
- `google search` and `google news` cost 1 credit and work without a key within a free limit. `google images` costs 1 credit per 10 images, and `--limit` returns fewer. Every other command here costs 1 credit.
- One call returns one page of results. Run the same command with the next `--page`, until a page has no results.
- `google news` takes `--topic` to read headlines by topic, and `--sort relevance` or `--sort newest`.
- `google scholar` takes `--sort relevance` or `--sort newest`, `--yearFrom` and `--yearTo`. Each result has a `citesId` you can pass back as `--citesId`.
- `google patents` takes `--inventor`, `--assignee`, `--status` and `--sort`.
- `google suggest` returns autocomplete phrases for a query.
- `web search` takes `--language`, and `--after` and `--before` as `YYYY-MM-DD`. `--time` cannot be sent with `--after` or `--before`, and `--after` cannot be later than `--before`.
- `web scrape --url` reads one page. `--urls` takes 2 to 10 addresses separated by commas, and needs a key. `results` holds one entry per address, in the order you sent them: the page with its `url`, or the `url` with an `error`. A repeated address is read once, each page costs what it costs alone, and a page that cannot be read is free.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube and TikTok videos and transcripts
- [stophy-social](../stophy-social/SKILL.md): posts and profiles on Reddit, Instagram, LinkedIn, and Pinterest
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries, including Google's
