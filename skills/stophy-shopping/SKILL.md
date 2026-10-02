---
name: stophy-shopping
description: |
  Get Walmart product data: search products by keyword, sort and price range, and read one product's price and details. Use for "find the cheapest", "how much does this cost at Walmart", "best selling air fryers", "compare prices for", "what is this product's rating". For homes use stophy-real-estate. For web results about a product use stophy-web.
metadata:
  author: stophy
  version: "4.0.1"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy shopping

Search products and read prices and details on Walmart.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# products by keyword
stophy walmart search "air fryer" --json -o .stophy/walmart.json

# the cheapest first, inside a price range
stophy walmart search "air fryer" --sort priceLow --minPrice 30 --maxPrice 100 --json -o .stophy/cheap.json

# one product's price and details, by ID or link from a search result
stophy walmart product "https://www.walmart.com/ip/32-onn-HD-Powered-by-VIZIO/17942205635" --json -o .stophy/product.json
```

Run `stophy walmart --help` for every command.

**Done when:** you name the specific product, its price, and its link. A generic "prices vary" is not enough.

## Tips

- `walmart search` costs 4 credits per call. `walmart product` costs 3. Run a search only when you need the list.
- `--sort` takes `relevance`, `priceLow`, `priceHigh`, `bestSelling`, `highest` or `newest`. `--minPrice` and `--maxPrice` keep results inside a range.
- Search first to get a product ID or link, then run `product` on it for the full details.
- Search returns one page. While `hasMore` is true, run the same command with `--page 2`, `--page 3` and so on, and keep the other options the same. Each page costs 4 credits again.

## See also

- [stophy-web](../stophy-web/SKILL.md): web results about a product
