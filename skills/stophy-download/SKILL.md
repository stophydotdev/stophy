---
name: stophy-download
description: |
  Save a website or one section of it as markdown files on disk, one file per page. Use for "download these docs", "save this site as markdown", "make a local copy of this documentation for context", "turn this blog into files". For a few pages you will read in chat, use stophy-crawl. For one page, use stophy-scrape.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy download

Crawl a site and write each page to a markdown file.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`), and `jq`. Crawling needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

Crawl the section, wait for it to finish, then write every page, 10 at a time:

```bash
id=$(stophy crawl "https://bun.com/docs/bundler" --limit 15 --json | jq -r .id)
until [ "$(stophy crawl status "$id" --json | jq -r .status)" != scraping ]; do sleep 5; done

mkdir -p bun-docs
cursor=""
while :; do
  stophy crawl status "$id" ${cursor:+--cursor "$cursor"} --json -o .stophy/page.json
  jq -c '.data[]' .stophy/page.json | while read -r page; do
    name=$(jq -r .metadata.sourceURL <<<"$page" | sed -E 's#^https?://##; s#[^A-Za-z0-9._-]+#_#g')
    jq -r .markdown <<<"$page" > "bun-docs/$name.md"
  done
  next=$(jq -r '.next // empty' .stophy/page.json)
  [ -z "$next" ] && break
  cursor=${next##*cursor=}
done
```

This writes files like `bun-docs/bun.com_docs_bundler_css.md`.

**Done when:** the crawl's status is `completed`, and there is one file for each page it read.

## Tips

- Start with `stophy map "<site>" --search <topic>` to see how many pages there are, then set `--limit`.
- The crawl stays under the start URL's path. `--includePaths` and `--excludePaths` narrow it.
- A crawl and its pages are kept for 24 hours, so you can write the files again without crawling again.
- It costs 1 credit a page.

## See also

- [stophy-crawl](../stophy-crawl/SKILL.md): map, crawl and batch scrape
- [stophy-docs](../stophy-docs/SKILL.md): answer one question from a site's docs without saving them
