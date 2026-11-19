---
"@stophy/cli": patch
---

The CLI shows the request ID and retry delay from the API error body when the response headers disagree. When only a `Retry-After` date is available, the CLI prints it without a seconds suffix.
