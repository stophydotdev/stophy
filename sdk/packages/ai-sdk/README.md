# @stophy/ai-sdk

Give your agents the live web. These are Stophy tools for the [Vercel AI SDK](https://ai-sdk.dev).

```bash
npm install @stophy/ai-sdk ai zod
```

```ts
import { generateText, isStepCount } from "ai";
import { readPage, webSearch } from "@stophy/ai-sdk";

const { text } = await generateText({
  model: "openai/gpt-5-mini",
  prompt: "What changed in the latest Bun release?",
  tools: { webSearch: webSearch(), readPage: readPage() },
  stopWhen: isStepCount(5),
});

console.log(text);
```

Each tool reads `STOPHY_API_KEY` from the environment. Without it, `webSearch`, `readPage`, `redditSearch` and `placeSearch` still work within free limits. The others return an error that tells the model a key is needed. Get a key at [stophy.dev](https://stophy.dev).

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

Most calls cost $0.001. The five site tools read the site's search page with a Stophy parser and return its JSON. A page that cannot be read costs nothing.

Pass a key or client options to any tool:

```ts
webSearch({ apiKey: process.env.STOPHY_KEY, timeoutMs: 30_000 });
```

## Every other source

Stophy has parsers for 103 kinds of pages, including YouTube, TikTok, LinkedIn, Booking and the App Store. These tools cover the common ones. For the rest, connect the hosted MCP server with the AI SDK's MCP client:

```ts
import { createMCPClient } from "@ai-sdk/mcp";

const stophy = await createMCPClient({
  transport: { type: "http", url: "https://api.stophy.dev/mcp" },
});
const tools = await stophy.tools();
```
