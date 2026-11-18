# Stophy docs

Mintlify site for docs.stophy.dev. Pages are MDX with YAML frontmatter. Configuration lives in `docs.json`. Merging to `main` publishes.

## Layout

Five tabs, in `docs.json`:

- Documentation: Get started (introduction, quickstart, SDKs, MCP, skill, CLI), Web data (one folder per product: `scrape`, `map`, `crawl`, `search`, `extract`, `agent`, `parse`, each with an `overview` page and one page per feature or option), Browser (`browser/*`), Automation (`batches`, `monitors`, `webhooks`), Account and billing (`account/*`), Production (`production/*`). A product's overview is its group's root page.
- API Reference: `api-reference/{introduction,errors}` (hand-written) and `api-reference/endpoint/*` (generated), one page per operation in the live OpenAPI document, in the groups `scripts/reference.config.json` names.
- Recipes: `recipes/*`, one goal per page, numbered steps with code.
- Integrations: `integrations/*`, coding agents and LLM SDKs.
- Changelog: `changelog`, one `<Update>` per week, newest first. Up to six bullets a week, one or two sentences each: a change the reader would notice or must act on, and the page that describes it now. Breaking changes always get a line, first. Field-level detail belongs on the linked page.

Page shape: a product overview opens with what it is for and when to pick it over another API, then one request, the fields of the response you read first, a table of formats or options linking to their pages, Price, and Choose another API. A feature page opens with one sentence on what it does for the reader, then one request, then prose: when to use it, what each option changes, the limits, the price, the errors, and what an empty result looks like.

## Generated files

`bun scripts/sync-openapi.ts` refreshes `api-reference/openapi.json` from the live API. `bun scripts/record-responses.ts` (needs `STOPHY_API_KEY`) calls examples live and saves the request and the trimmed response in `scripts/responses/`; it opens sessions and creates monitors, so run only the operations you need and clean up. `bun scripts/gen-reference.ts` writes `api-reference/endpoint/*.mdx` and the API Reference navigation in `docs.json`. `bun scripts/gen-parsers.ts` writes `scrape/prebuilt-parsers.mdx`, one page per parser under `scrape/prebuilt-parsers/<category>/`, and the Parse group's navigation, from `GET /v1/parsers`. Every operation belongs to one group and every parser to one category in `scripts/reference.config.json`; the scripts fail on one that is missing. Never hand-edit those files; edit the config and regenerate.

A removed page gets a redirect in `docs.json`, so no old link 404s.

## Checks

`mint validate` and `mint broken-links` must pass. Load changed pages in `mint dev`.

## Writing

- Plain words, short sentences, second person. Say what the reader gets.
- Explain more, show less code. A page has one request (one `<CodeGroup>` with the cURL, TypeScript and Python tabs) and at most one response, cut to the fields the text talks about. A recipe may show one request per step. Show any other option as an inline fragment in a sentence, such as `"onlyMainContent": true`, not as another full request.
- Every section opens with what it is for and when to use it. Say the trade-off and the trap: what goes wrong, what it costs, and what to do instead.
- Explanations state only what the live API or the server code does. If you cannot confirm a sentence, leave it out.
- Prices in dollars, as the catalog states them. The word credits appears only in field names such as `creditsUsed`.
- Every fact must match the live API (`/v1/endpoints`, `/openapi.json`) or the server code. Every example request must be a real call; free endpoints are free to call.
- Don't describe how Stophy gets its data or what runs it.
- Examples use cURL and the `stophy` SDK for TypeScript and Python, and only methods the published SDK has. A call the SDK cannot make, or an option its types lack, keeps Node.js `fetch` and Python `requests`. Check every SDK example against the SDK's types.
- Every page has `title`, a 120 to 160 character `description`, `og:title` as `<Title> | Stophy` and `og:description`. Use `sidebarTitle` when the title is longer than the sidebar label.
- Sentence case for headings.
