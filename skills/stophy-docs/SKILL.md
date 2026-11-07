---
name: stophy-docs
description: |
  Answer a developer question from a library's or API's own current docs: find the right docs page, read it, and quote it. Use for "how do I do X in this library", "what are the options for this API call", "is this method deprecated", "what changed in version N", and whenever your own knowledge of a library may be out of date. For general web questions, use stophy-search. To keep a whole docs site locally, use stophy-download.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy docs

Answer from the docs as they are today, not from memory.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Search, map and scrape work without a key, 10 calls a minute and 50 a day. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# find the page: search the docs site, or list its pages on the topic
stophy search "bun sqlite" --includeDomains bun.com --limit 3
stophy map "https://bun.com" --search sqlite --limit 5 --no-includeSubdomains

# read it
stophy scrape "https://bun.com/docs/runtime/sqlite" --maxChars 1500
```

**Done when:** you answer with the docs page's URL, and the code or option you give appears on that page.

## Tips

- Search with `--includeDomains` set to the docs site. If you don't know the site, search without it first and take the official domain from the results.
- `map --search` finds pages a search misses, such as API reference pages. It costs 1 credit for the whole list.
- Save a long page with `-o page.md` and read the part you need from the file, instead of cutting it with `--maxChars`.
- For a release or a changelog, scrape the project's releases or changelog page and quote the version line.
- A search costs 2 credits per 10 results, and a scrape 1 credit.

## See also

- [stophy-download](../stophy-download/SKILL.md): save a docs site as markdown files
- [stophy-scrape](../stophy-scrape/SKILL.md): read any page
