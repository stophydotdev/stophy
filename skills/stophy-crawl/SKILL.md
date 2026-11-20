---
name: stophy-crawl
description: Use to list a site's pages, read many pages of a site, scrape a list of URLs in one job, or save a site or docs section as markdown files.
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy crawl

Setup, keys and errors: [stophy](../stophy/SKILL.md). For one page, use [stophy-scrape](../stophy-scrape/SKILL.md).

```bash
stophy map "https://bun.com" --search sqlite --limit 5 --no-includeSubdomains
stophy crawl "https://bun.com/docs/bundler" --limit 10
stophy crawl status <id>
stophy batch scrape --urls "https://example.com,https://bun.com"
stophy batch scrape status <id>
```

- `map` answers at once with the site's URLs. Map first when you need only addresses, then scrape the pages that matter.
- `crawl` and `batch scrape` print an `id` and run in the background. `status` is `scraping` until it is `completed`, and `data` holds one entry per page with its `markdown` and `metadata.sourceURL`. Run `stophy crawl cancel <id>` to stop and keep the pages read so far.
- A crawl stays under the start URL's path. `--includePaths`, `--excludePaths`, `--maxDiscoveryDepth` and `--limit` narrow it.
- When a status answer has `next`, run `status <id> --cursor <c>`, with `<c>` the `cursor=` value in that link.
- A job and its pages are kept for 24 hours.

## Save a site as files

Needs `jq`. This writes one markdown file per page:

```bash
id=$(stophy crawl "https://bun.com/docs/bundler" --limit 10 --raw | jq -r .id)
until [ "$(stophy crawl status "$id" --raw | jq -r .status)" != scraping ]; do sleep 5; done
mkdir -p docs-copy && cursor=""
while :; do
  stophy crawl status "$id" ${cursor:+--cursor "$cursor"} --raw > page.json
  jq -c '.data[]' page.json | while read -r p; do
    name=$(jq -r .metadata.sourceURL <<<"$p" | sed -E 's#^https?://##; s#[^A-Za-z0-9._-]+#_#g')
    jq -r .markdown <<<"$p" > "docs-copy/$name.md"
  done
  next=$(jq -r '.next // empty' page.json); [ -z "$next" ] && break
  cursor=${next##*cursor=}
done
```

**Done when:** the job is `completed` and you read, or saved, every page you report on.

## Price and keys

`map` costs $0.0005 and works without a key. `crawl` and `batch scrape` cost $0.001 a page and need a key. Starting a job and a page that can't be read cost nothing.
