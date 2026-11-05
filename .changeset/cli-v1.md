---
"@stophy/cli": major
---

The CLI works with Stophy API v1. Every command reads the v1 responses again, `stophy scrape <url> --parser <name>` reads a site with one of its parsers, `stophy parsers` lists them, and `stophy crawl status <id>`, `crawl cancel`, `batch scrape status`, `batch scrape cancel` and `extract status` follow a job after it starts.
