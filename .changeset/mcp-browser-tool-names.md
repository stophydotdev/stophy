---
"@stophy/mcp": patch
---

The local server gives `stophy_browser_run` the same longer wait as `browserRun`, so a browser prompt or a raised `timeout` is not cut off at 65 seconds after the hosted tools were renamed.
