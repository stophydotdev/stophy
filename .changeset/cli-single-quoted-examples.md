---
"@stophy/cli": patch
---

Help examples quote values with single quotes, so code such as `page.$$eval(...)` copied from them reaches the browser as written instead of having `$$` replaced by the shell.
