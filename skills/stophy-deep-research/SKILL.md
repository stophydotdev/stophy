---
name: stophy-deep-research
description: Use for a question that needs many sources and cited claims, like "research this", "what does the evidence say", "write a sourced report", and for Google Patents and Google Trends.
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy deep research

Setup, keys and errors: [stophy](../stophy/SKILL.md).

## Steps

1. Search from several angles. Save each answer with `-o` and read the files.

   ```bash
   stophy search "malaria vaccine efficacy" --limit 5 --scrapeOptions.formats '["markdown"]' --json -o .stophy/web.json
   stophy search "malaria vaccine efficacy" --categories '["research"]' --limit 5
   stophy search "malaria vaccine" --sources '["news"]' --tbs qdr:m --limit 5
   stophy scrape "https://www.reddit.com/search/?q=malaria+vaccine" --parser reddit-search
   ```

2. Read the primary sources in full: the paper, the official page, the dataset. Use news and Reddit for what changed and what people report.

   ```bash
   stophy scrape "https://www.nature.com/articles/s41467-025-58963-4" -o .stophy/source.md
   ```

3. Stop when new searches return pages you already read. Scale the calls to the question: 1 for a fact, 3 to 8 for a comparison, up to 20 for a report.

**Done when:** every claim cites a URL from the output, the sources span at least 3 sites, and you say where they disagree, with one source for each side.

## One call

`stophy agent` searches, reads and fills fields itself, with a quote and URL for each field:

```bash
stophy agent "What is the name of the configuration file this page describes?" --urls "https://bun.com/docs/runtime/bunfig" --maxCredits 10
stophy agent status <id>
```

`--maxCredits` caps the spend in steps of $0.002. The default, 2500, is $5.

## Patents and trends

```bash
stophy scrape "https://patents.google.com/?q=solid+state+battery&assignee=Toyota" --parser google-patents
stophy scrape "https://trends.google.com/trends/explore?q=bitcoin&geo=US" --parser google-trends
```

`google-patents` (no key) reads a search with `q`, `inventor` or `assignee`. `google-trends` gives one term's related searches, and several terms, like `q=bitcoin,ethereum`, their interest over time.

## Price

A search costs $0.001 per 10 results from each source, plus $0.001 per web result with its text. A scrape or a parser call costs $0.001. `stophy agent` costs each search and page it reads, plus $0.003 for each planning or answering step.
