---
name: stophy-extract
description: |
  Pull the fields you name from up to 10 pages as JSON, each value checked against its page, from a plain-words prompt or a JSON schema. Use for "get the price and release date from these pages", "pull every plan and its price", "fill this schema from these sites". For one page, a json format on stophy-scrape is faster. For a site that has a parser, like Amazon or LinkedIn, use that parser instead.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy extract

Turn pages into the exact fields you need.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Extract needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# fields from a prompt
stophy extract --urls "https://bun.com" --prompt "the current Bun version and its release date"
stophy extract status <id>

# fields from a schema
stophy extract --urls "https://bun.com" --schema.type object --schema.properties '{"version":{"type":"string"},"releaseDate":{"type":"string"}}'
stophy extract status <id>

# one page, answered at once
stophy scrape "https://www.notion.com/pricing" --formats '[{"type":"json","schema":{"type":"object","properties":{"plans":{"type":"array","items":{"type":"object","properties":{"name":{"type":"string"},"monthlyPrice":{"type":"string"}}}}}}}]'
```

`extract` prints an `id`. `extract status <id>` returns `data` with your fields and a `confidence` from 0 to 1 for each.

**Done when:** you report each field as `data` gives it, and say when its confidence is low or the field is missing.

## Tips

- A schema gives steadier fields than a prompt. Use one when you need a list, like every plan on a pricing page.
- `--urls` takes up to 10 pages, separated by commas.
- `extract` costs 5 credits for most pages: the page's own price plus 4. A call that finds none of the fields is free. A json format on a scrape costs 1 credit plus 4 when it returns something.

## See also

- [stophy-scrape](../stophy-scrape/SKILL.md): one page as markdown or fields
- [stophy-crawl](../stophy-crawl/SKILL.md): find the pages first
