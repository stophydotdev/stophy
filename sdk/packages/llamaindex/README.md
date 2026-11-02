# llama-index-tools-stophy

Give your agents the live web. These are Stophy tools for [LlamaIndex](https://docs.llamaindex.ai).

```bash
pip install llama-index-tools-stophy
```

```python
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.llms.openai import OpenAI
from llama_index.tools.stophy import StophyToolSpec

agent = FunctionAgent(
    tools=StophyToolSpec().to_tool_list(),
    llm=OpenAI(model="gpt-5-mini"),
)
print(await agent.run("What changed in the latest Bun release?"))
```

`StophyToolSpec` reads `STOPHY_API_KEY` from the environment, or takes it as `StophyToolSpec(api_key="your-key")`. Without a key, web search, page reading, Reddit and Google Maps still work within free limits. The other tools raise an error that says a key is needed. Get a key at [stophy.dev](https://stophy.dev).

## Tools

| Tool             | What the agent gets                                   | Price per call     |
| ---------------- | ----------------------------------------------------- | ------------------ |
| `web_search`     | Ranked pages with title, url and description          | $0.0015            |
| `read_page`      | A page or PDF as markdown                             | $0.0015 to $0.0075 |
| `reddit_search`  | Reddit posts with score and comment count             | $0.0015            |
| `place_search`   | Google Maps places with rating, reviews and hours     | $0.0015            |
| `product_search` | Amazon products with price, rating and reviews        | $0.0015            |
| `job_search`     | Indeed jobs with company, location and salary         | $0.0015            |
| `home_search`    | Zillow homes for sale or rent with price, beds, baths | $0.003             |

`web_search` costs $0.0015 per 10 results. `read_page` costs more on pages that are hard to load. A call that fails or finds nothing costs nothing. These prices are for top-ups under $100.

For YouTube, TikTok, LinkedIn, Booking and the other Stophy endpoints, use the [`stophy`](https://pypi.org/project/stophy/) SDK or the hosted MCP server at `https://api.stophy.dev/mcp`.
