---
name: stophy-shopping
description: Use to find and compare products and prices, like "find the cheapest", "best laptop under $900", "how much is this on Amazon", "best sellers in", "find a used one on eBay or Craigslist", "is this store legit".
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy shopping

Setup, keys and errors: [stophy](../stophy/SKILL.md). Scrape the page a person would open, with the parser that reads it. Put price ranges, sort and condition in the store's own URL.

## Steps

1. List the options in the price range:

   ```bash
   stophy scrape "https://www.amazon.com/s?k=laptop&low-price=300&high-price=900" --parser amazon-search -o .stophy/amazon.json --json
   stophy scrape "https://www.ebay.com/sch/i.html?_nkw=iphone+15&_udlo=300&_udhi=800" --parser ebay-search
   ```

2. Read each finalist in full: `stophy scrape "https://www.amazon.com/dp/B0CX23V2ZK" --parser amazon-product`.
3. Check what buyers say: `reddit-search`, `amazon-reviews`, or `trustpilot-reviews` for the store.

**Done when:** every product you recommend has its price, store and link from the output, the date you read the prices, and each opinion you cite links to its review or post.

| Parser | Page |
|---|---|
| `amazon-search` | amazon.com/s?k=..., with Amazon's price, sort and department filters |
| `amazon-product` | amazon.com/dp/ASIN |
| `amazon-reviews` | a product page outside the US, like amazon.in/dp/ASIN: up to 13 top reviews. Amazon US shows reviews only after sign-in |
| `amazon-bestsellers` | an Amazon Best Sellers category page |
| `ebay-search`, `ebay-item` | ebay.com/sch/i.html?_nkw=..., ebay.com/itm/id |
| `tiktok-shop` | a TikTok Shop search (/k/), store or product page; `view: reviews` on a product |
| `facebook-marketplace` | facebook.com/marketplace/city/search?query=... |
| `craigslist-search`, `craigslist-listing` | a Craigslist search with a US ZIP code in `postal`, one post |
| `trustpilot-company`, `trustpilot-reviews`, `trustpilot-search` | trustpilot.com/review/domain, trustpilot.com/search?query=... |

- Compare at least two stores and one independent review source. Check the exact model, the stock and the total with shipping before you recommend.
- Prices change. Give the link so the reader can check.

## Price

$0.001 a call, except `craigslist-search`: $0.001 per 10 listings.
