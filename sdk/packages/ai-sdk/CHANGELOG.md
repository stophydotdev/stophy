# @stophy/ai-sdk

## 1.3.3

### Patch Changes

- 355e937: Fix TypeScript declarations for CommonJS consumers.
- Updated dependencies [355e937]
- Updated dependencies [85d8504]
- Updated dependencies [7b52ac4]
- Updated dependencies [2133fe0]
  - stophy@1.4.2

## 1.3.2

### Patch Changes

- 8af3fe2: The README and description use the new Stophy line and a shorter guide.
- Updated dependencies [8af3fe2]
  - stophy@1.4.1

## 1.3.1

### Patch Changes

- 5e37286: The README prices each tool in dollars, as the API does.
- Updated dependencies [59f3c85]
- Updated dependencies [8d6c1d8]
- Updated dependencies [5e37286]
- Updated dependencies [59f3c85]
  - stophy@1.4.0

## 1.3.0

### Minor Changes

- f4c8b40: The tools call Stophy API v1. `webSearch` and `readPage` call `search` and `scrape`. The five site tools keep their inputs and read the site's search page with its parser, so each returns the parser's JSON, such as `{ results, cursor, page, total }`.

### Patch Changes

- Updated dependencies [30e26b5]
  - stophy@1.3.0

## 1.0.0

### Major Changes

- 886026a: First release. Seven Stophy tools for the Vercel AI SDK: `webSearch`, `readPage`, `redditSearch`, `placeSearch`, `productSearch`, `jobSearch` and `homeSearch`. Add them to `generateText` with `tools: { webSearch: webSearch() }`.

### Patch Changes

- Updated dependencies [2e7ea8e]
  - stophy@1.2.2
