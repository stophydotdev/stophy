---
"@stophy/cli": patch
---

A `STOPHY_API_KEY` or saved key that an HTTP header cannot carry, such as one with a line break, is refused with a fixed message instead of printing the key. `stophy status` treats a bare HTTP 401 as a rejected key, and a person at a terminal sees the rejection on stderr. A minimum-version header that is not a version no longer triggers an upgrade warning.
