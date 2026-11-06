---
name: stophy-parse
description: |
  Turn a PDF, Word, Excel, PowerPoint or HTML file you hold into markdown. Use for "read this PDF", "what does this docx say", "summarize this spreadsheet", "get the text out of these slides". For a file that is online, scrape its URL with stophy-scrape instead: there is no size limit that way.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy parse

Read the text of a local document.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Parse works without a key, 10 calls a minute and 50 a day. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# a Word file and the first 2 pages of a PDF
stophy parse "$(base64 -w0 notes.docx)" --filename notes.docx
stophy parse "$(base64 -w0 spec.pdf)" --filename spec.pdf --maxPages 2

# a PDF that is online
stophy scrape "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" --parsers '["pdf"]'
```

The file goes in as base64.

**Done when:** you quote the file's own text, and say when `isTruncated` shows it had more pages than you read.

## Tips

- One shell argument holds at most 128 KB, so the CLI reads files up to about 96 KB. A bigger file fails with "Argument list too long". If the file is online, scrape its URL instead.
- `--maxPages` reads at most that many PDF pages, sheets or slides, up to 100.
- `--filename` names the file; the type is read from the file itself.
- A parse costs 1 credit.

## See also

- [stophy-scrape](../stophy-scrape/SKILL.md): read a page or a PDF by its URL
