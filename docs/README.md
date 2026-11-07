# Stophy docs

The source for [docs.stophy.dev](https://docs.stophy.dev), built with [Mintlify](https://mintlify.com).

## Run locally

```bash
npm i -g mint
mint dev
```

Open http://localhost:3000. Before you open a pull request, run `mint validate` and `mint broken-links`.

## The API reference

The API reference and the parser pages are generated from the live API:

```bash
bun scripts/sync-openapi.ts       # download https://api.stophy.dev/openapi.json into api-reference/openapi.json
bun scripts/record-responses.ts   # call every endpoint live and save scripts/responses/<operationId>.json
bun scripts/gen-reference.ts      # write api-reference/endpoint/*.mdx and the API Reference navigation in docs.json
bun scripts/gen-parsers.ts        # write sources/*.mdx from GET /v1/parsers
```

`record-responses.ts` needs `STOPHY_API_KEY` and spends a few cents. Pass operation ids to record only those, like `bun scripts/record-responses.ts crawl crawlStatus`. Each saved file holds the request that was sent and the trimmed response, and the endpoint page shows both. Don't edit the generated files. To change them, edit `scripts/reference.config.json`: the reference groups and titles, the calls to make, the fields to mask, and which parsers go on which page.

## Publishing

Mintlify deploys `main`. Open a pull request; merging it publishes.
