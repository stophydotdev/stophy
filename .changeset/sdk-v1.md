---
"stophy": major
---

The client matches Stophy API v1. The site methods such as `stophy.youtube.search` are gone. Call `scrape`, `search`, `map`, `crawl`, `batch.scrape`, `extract`, `parse` and the account methods, and read a site with `stophy.parsed(parser, url, options)`, which sends scrape's json format with that parser. `crawl.status`, `crawl.cancel`, `batch.scrape.status`, `batch.scrape.cancel` and `extract.result` take `{ id }`, and the status calls also take `cursor`. `StophyError` reads the flat error body: `message`, `code` and `retryAfterSeconds`, with `requestId` from the response header. The types `Usage`, `Logs`, `LogsQuery` and `LogEntry` are no longer exported. `key.revoke` and the cancel calls are not retried, so a lost reply never turns a revoke into a 401.
