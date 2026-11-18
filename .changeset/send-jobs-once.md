---
"stophy": patch
---

Every `POST` made with an API key carries an `Idempotency-Key`, the same on every retry, so a retry after a lost answer or a timeout cannot run a call twice. Pass `{ idempotencyKey }` as the second argument to choose it, or set `Idempotency-Key` in `headers`. A call with `zeroDataRetention` that is not a crawl or a batch scrape is not sent again after a lost answer: it throws `outcomeUnknown`. A `POST` that ends with no answer throws `StophyError` with the code `networkError` or `timeout` and the key in `details.idempotencyKey`. The TypeScript SDK retries a timed-out attempt, like the Python SDK. Aborting a call stops the wait between retries.
