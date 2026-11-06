# stophy

## 2.0.0

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
