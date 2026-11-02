# @stophy/mastra

Give your agents the live web. These are Stophy tools for [Mastra](https://mastra.ai).

```bash
npm install @stophy/mastra @mastra/core zod
```

```ts
import { Agent } from "@mastra/core/agent";
import { stophyTools } from "@stophy/mastra";

const researcher = new Agent({
  id: "researcher",
  name: "Researcher",
  instructions: "Answer with facts from the live web.",
  model: "openai/gpt-5-mini",
  tools: stophyTools(),
});

const { text } = await researcher.generate("What changed in the latest Bun release?");
console.log(text);
```

Each tool reads `STOPHY_API_KEY` from the environment. Without it, web search, page reading, Reddit and Google Maps still work within free limits. The other tools return an error that tells the model a key is needed. Get a key at [stophy.dev](https://stophy.dev).

## Tools

| Tool                | What the agent gets                                   | Price per call     |
| ------------------- | ----------------------------------------------------- | ------------------ |
| `webSearchTool`     | Ranked pages with title, url and description          | $0.0015            |
| `readPageTool`      | A page or PDF as markdown                             | $0.0015 to $0.0075 |
| `redditSearchTool`  | Reddit posts with score and comment count             | $0.0015            |
| `placeSearchTool`   | Google Maps places with rating, reviews and hours     | $0.0015            |
| `productSearchTool` | Amazon products with price, rating and reviews        | $0.0015            |
| `jobSearchTool`     | Indeed jobs with company, location and salary         | $0.0015            |
| `homeSearchTool`    | Zillow homes for sale or rent with price, beds, baths | $0.003             |

`webSearchTool` costs $0.0015 per 10 results. `readPageTool` costs more on pages that are hard to load. A call that fails or finds nothing costs nothing. These prices are for top-ups under $100.

Pass a key or client options to any tool, or to all of them:

```ts
stophyTools({ apiKey: process.env.STOPHY_KEY, timeoutMs: 30_000 });
```

For YouTube, TikTok, LinkedIn, Booking and the other Stophy endpoints, connect the hosted MCP server at `https://api.stophy.dev/mcp` with `@mastra/mcp`.
