---
"@stophy/cli": patch
---

A successful call keeps its request ID: `--raw` and the one-line agent output carry `requestId`, and `--json` prints `request id: <id>` after the cost on stderr. A failed call now always explains itself on stderr, with its request ID, even when an agent also gets the error as JSON on stdout. The cost line prints only after the output was written, and a file that cannot be written fails with its path.
