---
name: stophy-browser
description: |
  Have a real browser click through a public site to reach data behind a search box, filters or a form, and return what it found. Use for "search this site's own search for", "filter this listing by", "fill in this quote form and tell me the price", when no parser covers the site and a scrape of one URL can't reach the data. It stops before anything that pays, books, sends, submits or deletes, and never logs in. When the data has its own URL, use stophy-scrape: it is faster and cheaper.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy browser

Let a browser take the steps a person would take on a public site.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Browser tasks need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# start a task: where to begin, and what to get done
stophy browser task --url "https://www.python.org" --goal "Search the site for asyncio and return the first result's title and link" --maxSteps 6

# read the result with the id it printed
stophy browser task status <id>
```

The task answers at once with an `id` and `status: running`. `status` returns `result: null` while it runs. When it ends, `result.done` says whether the goal was met, `reason` says why it stopped if not, and `steps` lists what it did.

**Done when:** `result.done` is true and you report what the task found, or you report its `reason` and try a scrape or a parser instead.

## Tips

- Write the goal as one or two sentences a person could follow. Put inputs in `--values`, like `--values "from London, to Istanbul, date 2026-12-01"`.
- `--schema.type object --schema.properties '<json>'` returns the answer as those fields.
- A task takes at most 20 steps and 3 minutes, and is kept for 24 hours.
- It costs 3 credits a step, up to `--maxSteps`. Starting a task sets aside the most it can cost and returns what it does not use. A task that ends before its first step costs nothing.

## See also

- [stophy-scrape](../stophy-scrape/SKILL.md): `--actions` clicks and types on one page before reading it
