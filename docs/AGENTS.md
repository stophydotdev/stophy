# Stophy docs

Mintlify site for docs.stophy.dev. Pages are MDX with YAML frontmatter. Configuration lives in `docs.json`. Merging to `main` publishes.

## Layout

Five tabs, in `docs.json`:

- Documentation: Get started (introduction, quickstart, SDKs, MCP, skill, CLI), Web data (one folder per product: `scrape`, `map`, `crawl`, `search`, `extract`, `agent`, `parse`, each with an `overview` page and one page per feature or option), Browser (`browser/*`), Automation (`batches`, `monitors`, `webhooks`), Account and billing (`account/*`), Production (`production/*`). A product's overview is its group's root page.
- API Reference: `api-reference/{introduction,errors}` (hand-written) and `api-reference/endpoint/*` (generated), one page per operation in the live OpenAPI document, in the groups `scripts/reference.config.json` names.
- Recipes: `recipes/*`, one goal per page, numbered steps with code.
- Integrations: `integrations/*`, coding agents and LLM SDKs.
- Changelog: `changelog`, one `<Update>` per week, newest first.

Page shape: a product overview opens with one or two sentences, then Make a request, Read the response, a table of formats or options linking to their pages, Price, and Choose another API. A feature page opens with one sentence, then the request, the response, an options table, limits and errors, and related links.

## Generated files

`bun scripts/sync-openapi.ts` refreshes `api-reference/openapi.json` from the live API. `bun scripts/record-responses.ts` (needs `STOPHY_API_KEY`) calls examples live and saves the request and the trimmed response in `scripts/responses/`; it opens sessions and creates monitors, so run only the operations you need and clean up. `bun scripts/gen-reference.ts` writes `api-reference/endpoint/*.mdx` and the API Reference navigation in `docs.json`. `bun scripts/gen-parsers.ts` writes `scrape/prebuilt-parsers.mdx`, one page per parser under `scrape/prebuilt-parsers/<category>/`, and the Parse group's navigation, from `GET /v1/parsers`. Every operation belongs to one group and every parser to one category in `scripts/reference.config.json`; the scripts fail on one that is missing. Never hand-edit those files; edit the config and regenerate.

A removed page gets a redirect in `docs.json`, so no old link 404s.

## Checks

`mint validate` and `mint broken-links` must pass. Load changed pages in `mint dev`.

## Writing

- Plain words, short sentences, second person. Say what the reader gets.
- Prices in dollars, as the catalog states them. The word credits appears only in field names such as `creditsUsed`.
- Every fact must match the live API (`/v1/endpoints`, `/openapi.json`) or the server code. Every example request must be a real call; free endpoints are free to call.
- Don't describe how Stophy gets its data or what runs it.
- Examples use cURL, Node.js `fetch` and Python `requests`.
- Every page has `title`, a 120 to 160 character `description`, `og:title` as `<Title> | Stophy` and `og:description`. Use `sidebarTitle` when the title is longer than the sidebar label.
- Sentence case for headings.
