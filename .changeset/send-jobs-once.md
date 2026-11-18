---
"stophy": patch
---

A crawl, batch scrape or browser task is sent with one `Idempotency-Key` per call, the same on every retry, so a retry after a lost answer cannot start a second job. Aborting a call stops the wait between retries.
