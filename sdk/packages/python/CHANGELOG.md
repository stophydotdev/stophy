# stophy

## 1.4.0

- Every POST sends an `Idempotency-Key`, the same on each retry of that call. Pass your own with `idempotency_key=` on `scrape`, `search`, `map`, `parse`, `extract`, `crawl`, `batch.scrape`, `browser.task` and `browser.task.status`.
- `search.developer` is new, `search` takes `scrapeLimit`, twelve parsers are new, `extract` and `parse` no longer require a body, and results carry `costUsd`.
- The API already refuses everything below, so no working call stops working, but code that names these breaks.
- Breaking: `scrape` and `batch.scrape` no longer take `domain_tools`. `search` no longer takes `domain_tools`, `tool_detail` or `threat_protection`, nor the categories `developer` and `gov`. `crawl` no longer takes `ignore_robots_txt`. `signup` no longer takes `scopes`.
- Breaking: `parsed("company", ...)` is gone, because the `company` parser no longer exists.
- Breaking: these models are gone from `stophy.generated.models`: `EndpointCatalog`, `ScrapeLocation`, `ScrapeProfile`, `MapLocation`, `CrawlWebhook`, `ExtractSchema` and `BrowserTaskSchema`. Four are renamed: `ScrapeResponseDataAttributesItem` is now `SearchResponseDataWebItemAttributesItem`, `ScrapeResponseDataActionsScrapesItem` is now `SearchResponseDataWebItemActionsScrapesItem`, `ScrapeResponseDataChangeTrackingChangeStatus` is now `SearchResponseDataWebItemChangeTrackingStatus`, and `EndpointCatalogEndpointsItem`, `EndpointCatalogSourcesItem` and `EndpointCatalogSourcesItemKind` are now `ListEndpointsResponseEndpointsItem`, `ListEndpointsResponseSourcesItem` and `ListEndpointsResponseSourcesItemKind`. The numbered `Option` models are renamed too.
- `cacheState` can now also be `stale`, and an extract `status` can now also be `failed`.

## 1.3.0

- Breaking: the client calls Stophy API v1. The site methods such as `stophy.youtube.search` and `stophy.reddit.search` are gone.
- `scrape`, `search`, `map`, `crawl`, `batch.scrape`, `extract`, `parse`, `browser.task` and the account calls `limits`, `usage`, `logs`, `signup` and `key.revoke` are on `Stophy` and `AsyncStophy`.
- `crawl.status`, `crawl.cancel`, `batch.scrape.status`, `batch.scrape.cancel` and `extract.result` take `id=`. The status calls also take `cursor=`, read from the `next` link of the last answer.
- `parsed(parser, url, **options)` reads a site with one of the parsers from `parsers()`. `ParserName` lists them. Options can be snake_case or camelCase.
- `StophyError` reads the flat error body: the message, `code` and `retry_after_seconds`, with `request_id` from the response header.
- `Usage`, `Logs` and `LogEntry` are gone. `usage()` and `logs()` return the generated response types.

## 1.2.1

- The package links point to github.com/stophydotdev/stophy, where the source now lives.

## 1.2.0

- `craigslist.search`, `luma.events`, `luma.event`, `realtor.search`, `realtor.property` and `expedia.hotels` are new.
- Breaking: `reddit.discussions` no longer takes or returns `cursor`, and Reddit results no longer have `postKarma`, `commentKarma` or `isVerified`, because the API stopped returning them.

## 1.0.1

- New package description and keywords, and README examples for YouTube transcripts, Reddit, Google Maps reviews and Amazon products.

## 1.0.0

- Every endpoint is generated from the live Stophy API. Call `stophy.youtube.search(query=...)` and the same shape for every catalog endpoint, on `Stophy` and `AsyncStophy`.
- The old YouTube-only methods are gone: the `kids` and `music` namespaces, the hand-written YouTube methods, and `credits()`.
- The API key is optional. Without one, `web.search`, `youtube.search`, and `youtube.transcript` work on the free limit; other endpoints raise `StophyError` with code `unauthorized`.
- Errors include `retryable` and `retry_after_seconds`. A `Retry-After` over 60 seconds raises right away instead of waiting.
- Requests send `User-Agent: stophy-python/<version>`.
