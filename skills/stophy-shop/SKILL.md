---
name: stophy-shop
description: |
  Find the best product to buy: compare prices across Amazon, eBay and local listings, read the product's details, and check what buyers and reviewers say. Use for "find the best laptop under $900", "where is this cheapest", "is this worth buying", "find a used one near me", "is this seller legit". For one store's parsers and options, use stophy-shopping. For homes, use stophy-real-estate.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy shop

Compare offers and reviews before you recommend a product.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Search and `reddit-search` work without a key, 10 calls a minute and 50 a day. The store parsers need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# 1. the options in a price range
stophy scrape "https://www.amazon.com/s?k=laptop&low-price=300&high-price=900" --parser amazon-search --json -o .stophy/amazon.json
stophy scrape "https://www.ebay.com/sch/i.html?_nkw=iphone+15&_udlo=300&_udhi=800" --parser ebay-search

# 2. one product in full
stophy scrape "https://www.amazon.com/dp/B0CX23V2ZK" --parser amazon-product

# 3. what people say about it, and about the seller
stophy scrape "https://www.reddit.com/search/?q=best+laptop+under+900" --parser reddit-search
stophy search "best laptop under 900 review" --limit 3
stophy scrape "https://www.trustpilot.com/review/stripe.com?stars=1&stars=2" --parser trustpilot-reviews
```

**Done when:** every product you recommend has its price, store and link from the output, and every opinion you cite links to its post or review.

## Tips

- Put price ranges, sort and condition in the store's own URL, as above.
- Prices change. Say when you read them, and give the link to check.
- Amazon US shows reviews only after sign-in. For a product's reviews, use the same product on another marketplace with `amazon-reviews`, or search Reddit.
- Every call here costs 1 credit, except a search: 2 credits per 10 results.

## See also

- [stophy-shopping](../stophy-shopping/SKILL.md): every store parser and its options
- [stophy-video](../stophy-video/SKILL.md): video reviews
