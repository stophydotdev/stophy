# @stophy/ai-sdk

## 2.0.0

### Major Changes

- f4c8b40: The tools call Stophy API v1. `webSearch` and `readPage` call `search` and `scrape`. The five site tools keep their inputs and read the site's search page with its parser, so each returns the parser's JSON, such as `{ results, cursor, page, total }`.

### Patch Changes

- Updated dependencies [30e26b5]
  - stophy@2.0.0

## 1.0.0

### Major Changes

- 886026a: First release. Seven Stophy tools for the Vercel AI SDK: `webSearch`, `readPage`, `redditSearch`, `placeSearch`, `productSearch`, `jobSearch` and `homeSearch`. Add them to `generateText` with `tools: { webSearch: webSearch() }`.

### Patch Changes

- Updated dependencies [2e7ea8e]
  - stophy@1.2.2
