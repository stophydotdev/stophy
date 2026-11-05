---
"stophy": patch
---

The client matches Stophy API v1. The site methods such as `stophy.youtube.search` are gone. Call `scrape`, `search`, `map`, `crawl`, `batch.scrape`, `extract`, `parse` and the account methods, and read a site with `stophy.parsed(parser, url, options)`, which sends scrape's json format with that parser. `crawl.cancel`, `batch.scrape.cancel` and `extract.result` take `{ id }`. `StophyError` reads the flat error body: `message`, `code` and `retryAfterSeconds`, with `requestId` from the response header.
