---
"@stophy/mcp": patch
---

The README lists the tools the hosted server now has: `stophy_search`, `stophy_scrape`, `stophy_map`, `stophy_crawl`, `stophy_extract` and `stophy_signup`, next to `stophy_search_endpoints`, `stophy_describe_endpoint` and `stophy_call`. A site's own data, such as a Reddit search or a YouTube transcript, now comes from `stophy_scrape` with a parser in `formats`. Endpoint ids such as `googleSearch` and `youtubeSearch` are gone. `?toolsets=web` on the server URL gives each endpoint its own tool.
