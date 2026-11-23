---
"@stophy/cli": patch
---

Hitting the free daily limit without a key no longer starts a signup. The CLI shows the limit and how long to wait, and says to run `stophy login` for a key. In CI the wait time is no longer replaced by "No API key". A call that needs a key still starts a signup.
