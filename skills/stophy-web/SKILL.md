---
name: stophy-web
description: |
  Search the web, news and images, read any page as markdown, list and crawl a site's pages, pull named fields from pages, and read Google Scholar, Google Patents and Google Trends. Use for "search the web for", "find sources on", "latest news about", "read this page", "find every page on this site about", "find papers on", "what is trending on Google", "find the contact email on this site". Search, scrape and map work without an API key. For posts on social platforms use stophy-social. For ad libraries use stophy-ads.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy web

Find pages on a topic, read them, and pull the facts you need from them.

**Prerequisite:** `search`, `scrape`, `map` and the `google-patents` parser work without a key, 50 calls a day. Everything else here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# find pages, then news from the past week
stophy search "postgres 18 release notes" --limit 3
stophy search "nvidia" --sources '["news"]' --tbs qdr:w --limit 5

# read a page as markdown, and list a site's pages on one topic
stophy scrape "https://example.com"
stophy map "https://bun.com" --search sqlite --limit 5 --no-includeSubdomains

# pull named fields from a page, and read a few pages of a site (key needed)
stophy extract --urls "https://bun.com" --prompt "the current Bun version and its release date"
stophy crawl "https://bun.com/docs" --limit 3
stophy crawl status <id>
stophy extract status <id>

# papers, patents and trends
stophy scrape "https://scholar.google.com/scholar?q=malaria+vaccine+efficacy&scisbd=1" --parser google-scholar
stophy scrape "https://patents.google.com/?q=solid+state+battery&assignee=Toyota" --parser google-patents
stophy scrape "https://trends.google.com/trends/explore?q=bitcoin&geo=US" --parser google-trends

# the emails on a page
stophy scrape "https://www.hetzner.com/legal/legal-notice/" --parser emails
```

**Done when:** you report each result with its source URL, and every claim matches the output.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `google-scholar` | scholar.google.com/scholar with `q` or a cites id | citesId, yearFrom, yearTo, sort, type, page |
| `google-patents` (no key) | patents.google.com with `q`, `inventor` or `assignee` | status, type, after, before, sort, page |
| `google-trends` | trends.google.com/trends/explore with terms in `q`, or the trending now page | view: related, interest or regions |
| `emails` | any public page | |
| `phone-numbers` | any public page | country |

## Tips

- Search first, then scrape the pages that matter. Quote each result's `url`.
- `search --sources` takes `web`, `news` and `images`. `--tbs` filters by time: `qdr:h`, `qdr:d`, `qdr:w`, `qdr:m` or `qdr:y`. `--categories '["research"]'` keeps academic sites and `'["pdf"]'` PDF files. `--includeDomains` and `--excludeDomains` take up to 10 sites.
- `scrape --formats '["links"]'` picks what comes back: `markdown` (the default), `summary`, `links`, `html`, `screenshot` and more.
- `map --search` keeps the addresses that match, best first.
- `crawl` and `extract` print an `id` and finish in the background. Read the result with `crawl status <id>` or `extract status <id>`. `crawl --limit` caps the pages read, and `crawl cancel <id>` stops a crawl.
- A search costs $0.003 per 10 results from each source. A scrape, a map or a parser call costs $0.0015. `extract` costs about $0.01 a page, and nothing when it finds none of the fields. `crawl` costs $0.0015 a page.

## See also

- [stophy-social](../stophy-social/SKILL.md): posts and profiles on Reddit, Instagram, LinkedIn, X and more
- [stophy-video](../stophy-video/SKILL.md): YouTube and TikTok videos and transcripts
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries, including Google's
