---
"@stophy/cli": patch
---

The CLI starts faster: `stophy -V` reads no endpoint catalog, the config file is read directly, parsed JSON is not checked twice, and the spinner, prompts, browser opener and update check load only when a person needs them.
