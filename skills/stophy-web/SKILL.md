---
name: stophy-web
description: |
  Read Google Scholar, Google Patents and Google Trends: papers and the works that cite them, patents by topic, inventor or assignee, and what people search for. Use for "find papers on", "who cites this paper", "find patents on", "what patents does this company hold", "what is trending on Google", "is interest in this growing". For general web search use stophy-search. For a sourced report use stophy-deep-research.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy web

Papers, patents and search trends from Google.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). `google-patents` works without a key, 10 calls a minute and 50 a day. Scholar and Trends need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# newest papers on a topic
stophy scrape "https://scholar.google.com/scholar?q=malaria+vaccine+efficacy&scisbd=1" --parser google-scholar

# patents by topic and assignee
stophy scrape "https://patents.google.com/?q=solid+state+battery&assignee=Toyota" --parser google-patents

# related searches for a term
stophy scrape "https://trends.google.com/trends/explore?q=bitcoin&geo=US" --parser google-trends
```

**Done when:** you report each paper, patent or trend with its link, as the output gives it.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `google-scholar` | scholar.google.com/scholar with `q` or a cites id | citesId, yearFrom, yearTo, sort, type, page |
| `google-patents` (no key) | patents.google.com with `q`, `inventor` or `assignee` | status, type, after, before, sort, page |
| `google-trends` | trends.google.com/trends/explore with terms in `q`, or the trending now page | view: related, interest or regions |

## Tips

- In Scholar, `scisbd=1` in the URL sorts by date. Each result has a cites id: send `--parserOptions '{"citesId":"<id>"}'` for the works that cite it.
- In Trends, one term gives its related searches, and several terms, like `q=bitcoin,ethereum`, their interest over time.
- Every call here costs 1 credit.

## See also

- [stophy-search](../stophy-search/SKILL.md): web, news and images
- [stophy-deep-research](../stophy-deep-research/SKILL.md): a sourced report from many sources
