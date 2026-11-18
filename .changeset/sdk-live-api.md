---
"stophy": minor
---

The parser names and the response types match the live API. `search.developer` is new, `search` takes `scrapeLimit`, twelve parsers are new, `extract` and `parse` no longer require a body, and results carry `costUsd`.

The API already refuses everything below, so no working call stops working, but code that names these no longer compiles:

- `EndpointCatalog`, `ExtractInputSchema1` and `ExtractInputSchema2` are gone from the exported types.
- `parsed("company", ...)` is gone: the `company` parser no longer exists.
- `search` no longer takes the categories `developer` and `gov`, nor `domainTools`, `toolDetail` and `threatProtection`.
- `scrape` and `batch.scrape` no longer take `domainTools`, `crawl` no longer takes `ignoreRobotsTxt`, and `signup` no longer takes `scopes`.
- `cacheState` can now also be `stale`, and an extract `status` can now also be `failed`, so a `switch` over them needs a new case.
- In `BrowserTaskStatusResponse`, the values in `result.fields` can now be `null`.
