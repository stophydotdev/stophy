---
"stophy": patch
---

Every `POST` is sent with one `Idempotency-Key` per call, the same on every retry, so a retry after a lost answer or a timeout cannot run a call twice. A call with `zeroDataRetention` that is not a crawl or a batch scrape is not sent again after a lost answer: it throws `outcomeUnknown`. When a call sent more than once ends with a server error, the error says the request may still complete and carries the key in `details.idempotencyKey`. The TypeScript SDK retries a timed-out attempt, like the Python SDK. Aborting a call stops the wait between retries.
