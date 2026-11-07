---
name: stophy-shopping
description: |
  Get product data: search Amazon by keyword and price range, read one product's price and details and its reviews, see Amazon best sellers, search TikTok Shop, eBay, Facebook Marketplace and Craigslist, and read a store's Trustpilot reviews. Use for "find the cheapest", "how much does this cost on Amazon", "best selling air fryers", "compare prices for", "what is this product's rating", "find a used one on eBay", "find one on Craigslist near", "is this store legit". For homes for sale use stophy-real-estate. For web results about a product use stophy-web.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy shopping

Find products, compare prices and read what buyers say.

**Prerequisite:** the Stophy CLI 1.3.0 or later (`stophy --version`). Every parser here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# search Amazon in a price range, then read one product and its reviews
stophy scrape "https://www.amazon.com/s?k=laptop&low-price=300&high-price=900" --parser amazon-search --json -o .stophy/amazon.json
stophy scrape "https://www.amazon.com/dp/B0CX23V2ZK" --parser amazon-product
stophy scrape "https://www.amazon.in/dp/B0CHX1W1XY" --parser amazon-reviews

# the same thing used, nearby, or on TikTok Shop
stophy scrape "https://www.ebay.com/sch/i.html?_nkw=iphone+15&_udlo=300&_udhi=800" --parser ebay-search
stophy scrape "https://sfbay.craigslist.org/search/sss?query=bike&postal=94103" --parser craigslist-search
stophy scrape "https://shop.tiktok.com/us/k/gummies" --parser tiktok-shop

# is this store legit
stophy scrape "https://www.trustpilot.com/review/stripe.com?stars=1&stars=2" --parser trustpilot-reviews
```

**Done when:** you report each product with its price and link as the output gives them, and say which store each price is from.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `amazon-search` | amazon.com/s?k=... with Amazon's own price, sort and department filters | minRating, brand, page |
| `amazon-product` | amazon.com/dp/ASIN | country |
| `amazon-reviews` | a product page; outside the US, like amazon.in/dp/ASIN, shows up to 13 top reviews | country |
| `amazon-bestsellers` | an Amazon Best Sellers category page | page |
| `ebay-search` | ebay.com/sch/i.html?_nkw=... | condition, auctionsOnly, page |
| `ebay-item` | ebay.com/itm/id | |
| `tiktok-shop` | a TikTok Shop search (/k/), store or product page | view: reviews, cursor |
| `facebook-marketplace` | facebook.com/marketplace/city/search?query=... | minPrice, maxPrice, sort |
| `craigslist-search` | a Craigslist search with a US ZIP code in `postal` | minPrice, maxPrice, limit |
| `trustpilot-company` | trustpilot.com/review/domain | |
| `trustpilot-reviews` | trustpilot.com/review/domain, with stars filters | verifiedOnly, search, page |
| `trustpilot-search` | trustpilot.com/search?query=... | page |

## Tips

- Amazon US shows reviews only after sign-in, so `amazon-reviews` on amazon.com returns reviews for few products. Use the same product on another Amazon marketplace.
- Every call here costs 1 credit, except `craigslist-search`: 1 credit per 10 listings.

## See also

- [stophy-real-estate](../stophy-real-estate/SKILL.md): homes for sale and rent
- [stophy-web](../stophy-web/SKILL.md): web results and reviews about a product
