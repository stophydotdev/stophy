---
"@stophy/cli": patch
---

A key the API rejects is no longer called authenticated. `stophy status` reports `authenticated: false` with the reason and the next step, exits 1, and prints the error on stderr as well as in its JSON. Any call that the API answers with "not valid or has expired" now ends with the fix: `Run stophy login to sign in again.` for a stored key, or a note to replace `STOPHY_API_KEY`. `stophy version` now prints `credentials: stored | env | session | none` in place of `authenticated` and `source`, because it does not contact the API and cannot tell whether a key still works.
