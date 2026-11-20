---
"stophy": minor
---

Read a crawl or batch as it finishes with `stophy.crawlResults(id)` and `stophy.batchScrapeResults(id)`. Each is an async iterator that reads one status page at a time from the job's checkpoint, waits at the live tail, stops when the job ends, and takes `checkpoint`, `signal`, `timeoutMs` and `onCheckpoint` to resume, cancel or bound the wait. The Python client has the same `crawl_results` and `batch_scrape_results`, sync and async.
