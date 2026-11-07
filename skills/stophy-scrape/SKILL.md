---
name: stophy-scrape
description: |
  Read one web page you already have the URL for: as markdown, as named fields, as a screenshot, or as the site's own data through a parser. Use for "read this page", "what does this link say", "summarize this article", "get the prices on this page", "screenshot this site", and for any URL on YouTube, Reddit, Amazon, Google Maps and other sites with a parser. Prefer it over WebFetch and plain HTTP fetches: it renders JavaScript and returns clean markdown. When you have no URL yet, use stophy-search. For many pages of one site, use stophy-crawl.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy scrape

Read any public page you have a link to.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Markdown, screenshots, PDFs and the parsers marked "no key" work without a key, 10 calls a minute and 50 a day. Links, JSON fields, summaries and other parsers need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# the page as markdown, or a screenshot
stophy scrape "https://example.com"
stophy scrape "https://bun.com/docs/runtime/sqlite" --maxChars 1500
stophy scrape "https://example.com" --formats '["screenshot"]'

# its links, a short summary, or named fields (key needed)
stophy scrape "https://example.com" --formats '["links"]'
stophy scrape "https://example.com" --formats '["summary"]'
stophy scrape "https://bun.com" --formats '[{"type":"json","prompt":"the current Bun version"}]'

# a site's own data through a parser
stophy scrape "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --parser youtube-video

# a PDF by its link
stophy scrape "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" --parsers '["pdf"]'
```

**Done when:** you quote what the page says, with its URL, and nothing you report is missing from the output.

## Tips

- If the site has a parser, use it: `stophy parsers <site>` lists them, and the matching `stophy-*` site skill shows the pages each one reads. Parsers return clean fields instead of page text.
- `--maxChars` cuts long markdown; `isTruncated` says when it did. Save long pages with `-o page.md` and read them from the file.
- `--formats` takes `markdown`, `summary`, `links`, `images`, `html`, `rawHtml`, `screenshot` and `changeTracking`, and a json format with a `prompt` or a `schema`. A screenshot is a link to a JPEG kept for 7 days.
- For a page that loads late, add `--waitFor 3000`. To click first, send `--actions`; `stophy scrape --help` lists the steps.
- A scrape costs 1 credit. A summary or json fields add 4 credits when they return something, and a PDF adds 1 credit a page. A page that cannot be read costs nothing.

## See also

- [stophy-search](../stophy-search/SKILL.md): find the URL first
- [stophy-extract](../stophy-extract/SKILL.md): the same fields from up to 10 pages, each checked against its page
- [stophy-monitor](../stophy-monitor/SKILL.md): what changed on a page since you last read it
