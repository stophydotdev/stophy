---
"@stophy/cli": patch
---

A key the API rejects is no longer called authenticated. `stophy status` reports `authenticated: false` with the reason and the next step, exits 1, and prints the error on stderr as well as in its JSON. Any call that the API answers with "not valid or has expired" now ends with the fix: `Run stophy logout, then stophy login.` for a stored key, or a note to replace `STOPHY_API_KEY`. `stophy version` prints `credentials: stored | env | session | none` and says nothing about whether the key works; its JSON keeps `authenticated` and `source` for scripts, and `authenticated` only means a key is present.
