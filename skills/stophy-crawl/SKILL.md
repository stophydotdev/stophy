---
name: stophy-crawl
description: |
  List every page on a site, read many pages of a site, or scrape a list of URLs in one job. Use for "find every page on this site about", "what pages does this site have", "read the whole docs section", "scrape these 50 links". Map answers at once; crawl and batch scrape run in the background and return an id. For one page, use stophy-scrape. To save a site as markdown files, use stophy-download.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy crawl

Find a site's pages and read many of them at once.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). `map` works without a key, 10 calls a minute and 50 a day. `crawl` and `batch scrape` need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# list a site's pages, best matches first
stophy map "https://bun.com" --search sqlite --limit 5 --no-includeSubdomains

# read up to 3 pages under /docs, then read the result
stophy crawl "https://bun.com/docs" --limit 3
stophy crawl status <id>

# scrape a list of URLs in one job
stophy batch scrape --urls "https://example.com,https://bun.com"
stophy batch scrape status <id>

# stop a crawl and keep the pages already read
stophy crawl cancel <id>
```

**Done when:** the job's status is `completed`, and you read every page you report on.

## Tips

- Map first when you only need addresses: it costs 1 credit for the whole list. Then scrape or batch scrape the pages that matter.
- `crawl` stays under the start page's path. `--includePaths` and `--excludePaths` narrow it, `--maxDiscoveryDepth` caps how far it follows links, and `--limit` caps the pages read.
- `status` is `scraping` until the job is `completed`. Pages come 10 at a time: when the status has a `next` link, run `status <id> --cursor <c>`, where `<c>` is the `cursor=` value in that link.
- A job and its pages are kept for 24 hours.
- A crawl or batch scrape costs 1 credit a page. Starting a job and a page that cannot be read cost nothing.

## See also

- [stophy-download](../stophy-download/SKILL.md): save a crawl as markdown files
- [stophy-extract](../stophy-extract/SKILL.md): pull the same fields from many pages
