---
name: stophy-browser
description: Use when the data sits behind a public site's search box, filters or form and no URL or parser reaches it, like "fill in this quote form and tell me the price". A real browser takes the steps and returns what it found.
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy browser

Setup, keys and errors: [stophy](../stophy/SKILL.md). First build the most specific URL you can and try `stophy scrape` or a parser. They are faster and cost less.

```bash
stophy browser task --url "https://www.python.org" --goal "Search the site for asyncio and return the first result's title and link" --maxSteps 6
stophy browser task status <id>
```

The task answers at once with an `id`. `status` returns `result: null` while it runs. When it ends, `result.done` says whether it met the goal, `result.answer` holds what it found, `result.steps` lists what it did, and `reason` says why it stopped short.

- Write the goal as one or two sentences a person could follow. Put inputs in `--values`, like `--values "from London, to Istanbul, date 2026-12-01"`.
- `--schema '<json schema>'` returns the answer as those fields.
- A task takes at most 50 steps and 10 minutes, and is kept for 24 hours. It never logs in, and it stops before anything that pays, books, sends, submits or deletes.

**Done when:** you report what the task found, or its `reason`, and end with `Status: done`, `partial` or `blocked`.

## Price

$0.84 per hour of browser time, billed by the minute with one minute at least, up to `--maxCost` dollars. A task that ends before its first step costs nothing. Needs a key.
