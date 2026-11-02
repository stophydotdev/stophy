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

| Tool            | What the model gets                                   | Price per call     |
| --------------- | ----------------------------------------------------- | ------------------ |
| `webSearch`     | Ranked pages with title, url and description          | $0.0015            |
| `readPage`      | A page or PDF as markdown                             | $0.0015 to $0.0075 |
| `redditSearch`  | Reddit posts with score and comment count             | $0.0015            |
| `placeSearch`   | Google Maps places with rating, reviews and hours     | $0.0015            |
| `productSearch` | Amazon products with price, rating and reviews        | $0.0015            |
| `jobSearch`     | Indeed jobs with company, location and salary         | $0.0015            |
| `homeSearch`    | Zillow homes for sale or rent with price, beds, baths | $0.003             |

`webSearch` charges $0.0015 per 10 results. `readPage` costs more only on the hardest pages to reach. A call that fails or finds nothing costs nothing. These prices are for top-ups under $100.

Pass a key or client options to any tool:

```ts
webSearch({ apiKey: process.env.STOPHY_KEY, timeoutMs: 30_000 });
```

## Every other source

Stophy has 137 endpoints, including YouTube, TikTok, LinkedIn, Booking and the App Store. These tools cover the common ones. For the rest, connect the hosted MCP server with the AI SDK's MCP client:

```ts
import { createMCPClient } from "@ai-sdk/mcp";

const stophy = await createMCPClient({
  transport: { type: "http", url: "https://api.stophy.dev/mcp" },
});
const tools = await stophy.tools();
```
