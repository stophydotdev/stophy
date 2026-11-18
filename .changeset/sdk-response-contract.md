---
"stophy": patch
---

The response types now match the API. Scrape and parse report the cost in `data.metadata.costUsd`, not at the top level. Extract results can report `success: false` when the job fails.
