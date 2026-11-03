# Stophy

Give your agents the live web. One API to search the web, read what people say, and look up products, places, jobs and homes.

This plugin adds seven Stophy tools to Dify agents, chatflows and workflows. Every tool returns JSON.

Source repository: https://github.com/stophydotdev/stophy/tree/main/integrations/dify

## Tools

| Tool           | What it returns                                       | Price per call     |
| -------------- | ----------------------------------------------------- | ------------------ |
| Web Search     | Ranked pages with title, URL and description          | $0.0015            |
| Read Page      | A web page or PDF as markdown                         | $0.0015 to $0.0075 |
| Reddit Search  | Reddit posts with score and comment count             | $0.0015            |
| Place Search   | Google Maps places with rating, reviews and hours     | $0.0015            |
| Product Search | Amazon products with price, rating and reviews        | $0.0015            |
| Job Search     | Indeed jobs with company, location and salary         | $0.0015            |
| Home Search    | Zillow homes for sale or rent with price, beds, baths | $0.003             |

Web Search costs $0.0015 per 10 results. Read Page costs more on pages that are hard to load. A call that fails or finds nothing costs nothing. These prices are for top-ups under $100.

## Setup

1. Get an API key at [stophy.dev/signup](https://stophy.dev/signup). New accounts start with $5 free, about 3,333 calls.
2. In Dify, open **Plugins**, find **Stophy** in the Marketplace and install it.
3. Open the plugin, click **Authorize** and paste your API key. Dify checks the key before saving it.

## Usage

- **Agents:** add the Stophy tools to an agent app. The agent picks one, such as Web Search to find pages and Read Page to read them.
- **Workflows and chatflows:** add a tool node, choose a Stophy tool and map its inputs. Use the `json` output in later nodes. Read Page puts the page text in `json.markdown`.

Example: a workflow runs **Reddit Search** for a product name, then an LLM node summarizes what people like and dislike about it.

## Credentials

The plugin needs a Stophy API key. Dify stores it as a secret. The plugin sends it only to the Stophy API, in the `Authorization` header, and never logs it.

## Connection requirements

The plugin connects only to the Stophy API at `https://api.stophy.dev` over HTTPS, so your Dify instance needs outbound access to that host. Read Page sends the URL you give it to the Stophy API, which fetches the page. The plugin never fetches it itself.

## Support

Email support@stophy.dev, or open an issue at https://github.com/stophydotdev/stophy/issues.
