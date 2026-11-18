# Stophy

Search, read, and act on the web. This plugin adds seven Stophy tools to Dify agents, chatflows and workflows, and every tool returns JSON.

Source repository: https://github.com/stophydotdev/stophy/tree/main/integrations/dify

## Setup

1. Get an API key at [stophy.dev/signup](https://stophy.dev/signup). New accounts start with $2 free, no card needed.
2. In Dify, open **Plugins**, find **Stophy** in the Marketplace and install it.
3. Open the plugin, click **Authorize** and paste your API key. Dify checks the key before saving it.

## Example

A workflow runs **Reddit Search** for a product name, then an LLM node summarizes what people like and dislike about it.

## Tools

| Tool           | What it returns                                       | Price per call                               |
| -------------- | ----------------------------------------------------- | -------------------------------------------- |
| Web Search     | Ranked pages with title, URL and description          | $0.001 for each 10 results                   |
| Read Page      | A web page or PDF as markdown                         | $0.001, plus $0.0005 to $0.0025 per PDF page |
| Reddit Search  | Reddit posts with score and comment count             | $0.001                                       |
| Place Search   | Google Maps places with rating, reviews and hours     | $0.001                                       |
| Product Search | Amazon products with price, rating and reviews        | $0.001                                       |
| Job Search     | Indeed jobs with company, location and salary         | $0.001                                       |
| Home Search    | Zillow homes for sale or rent with price, beds, baths | $0.004                                       |

The five site tools read the site's search page with a Stophy parser and return its JSON. A page that cannot be read costs nothing.

## Use the tools

In an agent app, add the Stophy tools and the agent picks one, such as Web Search to find pages and Read Page to read them. In a workflow or chatflow, add a tool node, choose a Stophy tool and map its inputs. Use the `json` output in later nodes. Read Page puts the page text in `json.markdown`.

## Key and connection

The plugin needs a Stophy API key. Dify stores it as a secret, and the plugin sends it only to the Stophy API at `https://api.stophy.dev` over HTTPS, in the `Authorization` header, and never logs it. Your Dify instance needs outbound access to that host. Read Page sends the URL you give it to the Stophy API, which fetches the page. The plugin never fetches it itself.

## Support

Email support@stophy.dev, or open an issue at https://github.com/stophydotdev/stophy/issues.
