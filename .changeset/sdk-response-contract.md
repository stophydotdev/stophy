---
"stophy": patch
---

The response types now match the API. Scrape, search, map, parse, and the starts and cancels of crawl, batch and extract jobs no longer have top-level `costUsd`, `creditsUsed` or `requestId`; the cost is the `x-cost-usd` header, and scrape and parse also keep it in `data.metadata.costUsd`. Extract results can report `success: false` when the job fails.
