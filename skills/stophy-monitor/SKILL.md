---
name: stophy-monitor
description: |
  Check whether a web page changed since you last read it, and see the exact lines that changed. Use for "has this pricing page changed", "watch this page", "what's new on this changelog since last week", "did the terms of service change". Each check is one scrape; run it on a schedule to watch a page. For a page you read once, use stophy-scrape.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy monitor

See what changed on a page between two reads.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Change tracking needs `stophy login --browser` or `STOPHY_API_KEY`: the last read is kept per key. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# is it new, the same, or changed since this key last read it?
stophy scrape "https://example.com" --formats '["markdown","changeTracking"]'

# the changed lines as a diff
stophy scrape "https://httpbin.org/uuid" --formats '["markdown",{"type":"changeTracking","modes":["git-diff"]}]'
```

`changeTracking.changeStatus` is `new` the first time this key reads the page, then `same` or `changed`. `previousScrapeAt` says when the last read was. With `git-diff`, a changed page also returns `diff`:

```
-  "uuid": "d77708ce-095a-421a-b864-cb1cb6c43219"
+  "uuid": "c4b7862b-6cc5-49e1-a2a9-931970be0773"
```

**Done when:** you say whether the page changed since `previousScrapeAt`, and quote the changed lines from `diff`.

## Tips

- Send the same options every time. A read with other options is compared on its own.
- A read is kept for 30 days.
- To watch a page, run the same command on a schedule, such as a cron job, and act when `changeStatus` is `changed`.
- Each check costs 1 credit.

## See also

- [stophy-scrape](../stophy-scrape/SKILL.md): every other format of a page
- [stophy-competitive-intel](../stophy-competitive-intel/SKILL.md): watch a rival's pricing and ads
