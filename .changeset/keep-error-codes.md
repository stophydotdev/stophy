---
"stophy": patch
"@stophy/cli": patch
---

Errors keep the API's `code`, `retryable`, request id and extra fields. A permanent `sourceChanged` is tried once, `profileBusy` is retried, and the CLI signs up after `freeLimit` and `apiKeyRequired`.
