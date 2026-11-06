---
name: stophy-deep-research
description: |
  Answer a hard question with many sources: search the web, papers and discussions, read the best sources in full, and cite each claim. Use for "research this topic", "what does the evidence say about", "write a sourced report on", "compare what experts and users say about". For a quick fact, use stophy-search. For a library's docs, use stophy-docs.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy deep research

Gather sources from several angles, read them, and cite them.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Search, scrape, `reddit-search` and `google-patents` work without a key, 10 calls a minute and 50 a day. Google Scholar and extract need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# 1. the web, with the top results' text, and the news
stophy search "malaria vaccine efficacy" --limit 3 --scrapeOptions.formats '["markdown"]' --json -o .stophy/web.json
stophy search "malaria vaccine efficacy" --categories '["research"]' --limit 3
stophy search "malaria vaccine" --sources '["news"]' --tbs qdr:m --limit 3

# 2. papers, and what people say
stophy scrape "https://scholar.google.com/scholar?q=malaria+vaccine+efficacy&scisbd=1" --parser google-scholar
stophy scrape "https://www.reddit.com/search/?q=malaria+vaccine" --parser reddit-search

# 3. read a source in full, or pull the same fields from several
stophy scrape "https://www.nature.com/articles/s41467-025-58963-4" -o .stophy/source.md
stophy extract --urls "https://www.nature.com/articles/s41467-025-58963-4" --prompt "the vaccines discussed and the efficacy figure reported for each"
```

**Done when:** every claim in your answer cites a URL from the output, and you say where sources disagree.

## Tips

- Search from more than one angle: the plain question, `--categories '["research"]'`, news, and Reddit for first-hand reports.
- With `--scrapeOptions.formats '["markdown"]'`, each web result comes with its text, so you read it without a second call. Save it with `-o` and read from the file.
- Prefer primary sources: the paper, the official page, the dataset. Use news and Reddit for what changed and what people report.
- A search costs 2 credits per 10 results from each source, plus 1 credit per web result with its text. A scrape or parser call costs 1 credit, and extract about 5 credits a page.

## See also

- [stophy-search](../stophy-search/SKILL.md), [stophy-scrape](../stophy-scrape/SKILL.md), [stophy-extract](../stophy-extract/SKILL.md)
- [stophy-web](../stophy-web/SKILL.md): Google Scholar, Patents and Trends
