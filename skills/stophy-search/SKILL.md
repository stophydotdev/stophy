---
name: stophy-search
description: Use to search the web, news, images, papers or YouTube when you have no URL yet, and for "how do I do X in this library" questions answered from the current docs.
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy search

Setup, keys and errors: [stophy](../stophy/SKILL.md).

```bash
stophy search "postgres 18 release notes" --limit 3
stophy search "nvidia" --sources '["news"]' --tbs qdr:w --limit 5
stophy search "malaria vaccine efficacy" --categories '["research"]' --limit 3
stophy search "bun sqlite" --limit 2 --scrapeOptions.formats '["markdown"]'
```

Results come back by source: `web`, `news`, `images`, `research` and `videos`.

## Options

- `--sources` takes `web`, `news` and `images`. `--categories` takes `research` for papers, `videos` for YouTube and `pdf` for PDF files.
- `--tbs` keeps recent results: `qdr:d`, `qdr:w`, `qdr:m` or `qdr:y`. `sbd:1,qdr:w` sorts the past week newest first. Web also takes `cdr:1,cd_min:MM/DD/YYYY,cd_max:MM/DD/YYYY`.
- `--includeDomains` and `--excludeDomains` take up to 10 sites. `--country de` or `--location "Berlin,Germany"` searches from there.
- `--scrapeOptions.formats '["markdown"]'` returns each web result's page text, so you skip a scrape.

## How to search

- Keep the query short: 2 to 6 words, one subject. Put dates in `--tbs`, not in the query.
- Read the 2 or 3 results that answer the question with `stophy scrape`. Skip the scrape when the snippet already states the fact.
- An empty result is not proof that a thing does not exist. Rephrase once, or scrape the page you expect.

Good: `stophy search "bun sqlite" --includeDomains bun.com`. Bad: `stophy search "how do I use sqlite with bun in 2026 tutorial"`.

## Docs questions

Answer from the docs as they are today:

```bash
stophy search "bun sqlite" --includeDomains bun.com --limit 3
stophy map "https://bun.com" --search sqlite --limit 5
stophy scrape "https://bun.com/docs/runtime/sqlite" -o .stophy/page.md
```

If you don't know the docs site, search without `--includeDomains` and take the official domain from the results. `map --search` finds reference pages that a search misses.

**Done when:** each fact you report has the URL of the result or page it came from.

## Price

$0.001 per 10 results from each source. With `--scrapeOptions`, each web result with its page text adds $0.001.
