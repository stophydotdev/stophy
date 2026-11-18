# @stophy/ai-sdk

Search, read, and act on the web. These are Stophy tools for the [Vercel AI SDK](https://ai-sdk.dev).

## Install

```bash
npm install @stophy/ai-sdk ai zod
```

## Example

```ts
import { generateText, isStepCount } from "ai";
import { readPage, webSearch } from "@stophy/ai-sdk";

const { text } = await generateText({
  model: "openai/gpt-5-mini",
  prompt: "What changed in the latest Bun release?",
  tools: { webSearch: webSearch(), readPage: readPage() },
  stopWhen: isStepCount(5),
});
```

The model searches, picks a page, reads it and answers. Give it only the tools it needs: `webSearch` and `readPage` cover most questions, and the five site tools help when the answer lives on one site.

## Tools

| Tool            | What the model gets                                   | Price per call                               |
| --------------- | ----------------------------------------------------- | -------------------------------------------- |
| `webSearch`     | Ranked pages with title, url and description          | $0.001 for each 10 results                   |
| `readPage`      | A page or PDF as markdown                             | $0.001, plus $0.0005 to $0.0025 per PDF page |
| `redditSearch`  | Reddit posts with score and comment count             | $0.001                                       |
| `placeSearch`   | Google Maps places with rating, reviews and hours     | $0.001                                       |
| `productSearch` | Amazon products with price, rating and reviews        | $0.001                                       |
| `jobSearch`     | Indeed jobs with company, location and salary         | $0.001                                       |
| `homeSearch`    | Zillow homes for sale or rent with price, beds, baths | $0.004                                       |

The five site tools read the site's search page with a Stophy parser and return its JSON. A page that cannot be read costs nothing.

## API key

Each tool reads `STOPHY_API_KEY` from the environment. Without it, `webSearch`, `readPage`, `redditSearch` and `placeSearch` still work within free limits. The others return an error that tells the model a key is needed. Get a key at [stophy.dev/signup](https://stophy.dev/signup).

To pass a key or client options, hand them to the tool: `webSearch({ apiKey: process.env.STOPHY_KEY, timeoutMs: 30_000 })`.

## Errors and retries

The tools call the [`stophy`](https://www.npmjs.com/package/stophy) client, so a failed call throws its `StophyError`, and the AI SDK hands the message to the model as a tool error. The client retries network errors and errors the API marks retryable, twice by default. Set `maxRetries` to change that.

## Every other source

Stophy has parsers for more than 100 kinds of pages, including YouTube, TikTok, LinkedIn, Booking and the App Store. These tools cover the common ones. For the rest, connect the hosted MCP server with the AI SDK's MCP client, with the transport `{ type: "http", url: "https://api.stophy.dev/mcp" }`, or call `parsed` in the `stophy` client from your own tool.

## Docs

- [Vercel AI SDK guide](https://docs.stophy.dev/integrations/vercel-ai-sdk) covers the tools and the MCP client.
- [Pricing](https://docs.stophy.dev/account/pricing) lists what each call costs.

## License

MIT
