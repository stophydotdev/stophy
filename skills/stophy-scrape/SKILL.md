---
name: stophy-scrape
description: Use to read a URL or a local file (PDF, Word, Excel, PowerPoint) as markdown, named fields, a screenshot or a summary, to pull the same fields from up to 25 pages, or to check whether a page changed since the last read.
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy scrape

Setup, keys and errors: [stophy](../stophy/SKILL.md). If the URL is on a site with a parser, like YouTube, Reddit or Amazon, add `--parser`: `stophy parsers <site>` lists them.

## A page

```bash
stophy scrape "https://bun.com/docs/runtime/sqlite" --maxChars 1500
stophy scrape "https://example.com" --formats '["screenshot"]'
stophy scrape "https://example.com" --formats '["links"]'
stophy scrape "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
```

- `--formats` takes `markdown`, `summary`, `links`, `images`, `html`, `rawHtml`, `screenshot` and `changeTracking`. A screenshot is a JPEG link kept for 7 days.
- `--maxChars` cuts long text, and `isTruncated` says it did. Or save with `-o page.md` and read the file.
- A page that loads late: add `--waitFor 3000`. To click or type first: `--actions`, listed in `stophy describe scrape`.
- When a read fails or comes back thin, try once with `--waitFor`, then a parser, then [stophy-browser](../stophy-browser/SKILL.md). Stop after that and report what failed.

## Fields

One page, answered at once:

```bash
stophy scrape "https://www.notion.com/pricing" --formats '[{"type":"json","schema":{"type":"object","properties":{"plans":{"type":"array","items":{"type":"object","properties":{"name":{"type":"string"},"monthlyPrice":{"type":"string"}}}}}}}]'
```

Up to 25 pages, each value checked against its page:

```bash
stophy extract --urls "https://bun.com" --prompt "the current Bun version and its release date"
stophy extract status <id>
```

`extract` prints an `id`. `extract status <id>` returns `data` with the fields and a `confidence` from 0 to 1 for each. Report a low confidence or a missing field as such. A schema gives steadier fields than a prompt.

## A local file

```bash
stophy parse --file "$(base64 < notes.docx | tr -d '\n')" --filename notes.docx --maxPages 10
```

The file goes on the command line, so keep it under 96 KB. For a file online, scrape its URL. `isTruncated` says the file had more pages than `--maxPages`.

## Changes since the last read

```bash
stophy scrape "https://httpbin.org/uuid" --formats '["markdown",{"type":"changeTracking","modes":["git-diff"]}]'
```

`changeTracking.changeStatus` is `new` the first time your key reads the page, then `same` or `changed`, with `previousScrapeAt` and a `diff`. Send the same options each time, since other options start a new history. A read is kept for 30 days. To watch a page, run the command on a schedule.

**Done when:** everything you report is in the output, with the page's URL.

## Price and keys

A scrape costs $0.001. `summary` and a json format add $0.003 when they return something. A PDF adds $0.0005 a page of text, or $0.0025 a page read from an image, and `parse` costs the same per page. `extract` costs $0.005 a page and nothing when it finds no field. A page that can't be read costs nothing. Without a key, every format works except json fields and `changeTracking`, and `extract` needs a key too.
