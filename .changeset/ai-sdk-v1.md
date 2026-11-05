---
"@stophy/ai-sdk": patch
---

The tools call Stophy API v1. `webSearch` and `readPage` call `search` and `scrape`. The five site tools keep their inputs and read the site's search page with its parser, so each returns the parser's JSON, such as `{ results, cursor, page, total }`.
