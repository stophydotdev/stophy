---
name: stophy-shopping
description: |
  Get product listings, prices, and best sellers from Amazon, Walmart, AliExpress, and any Shopify store. Use for "what does this product cost", "find the cheapest", "what is selling well in this category", "does this store carry", "compare prices for this item". For app listings use stophy-apps. For places and local businesses use stophy-places.
metadata:
  author: stophy
  version: "4.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy shopping

Search products and prices on Amazon, Walmart, AliExpress, and Shopify stores.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# search a marketplace by keyword
stophy amazon search "wireless earbuds" --sort priceLow --json -o .stophy/amazon.json

# one product's price and details
stophy amazon product B08N5WRWNW --json -o .stophy/product.json

# best sellers in a category
stophy amazon bestsellers electronics --limit 50 --json -o .stophy/bestsellers.json

# the same on Walmart and AliExpress
stophy walmart search "air fryer" --sort priceLow --json -o .stophy/walmart.json
stophy aliexpress search "phone case" --limit 60 --json -o .stophy/aliexpress.json

# a Shopify store's catalog
stophy shopify products allbirds.com --limit 50 --json -o .stophy/shopify.json
```

Run `stophy <source> --help` for every command. The sources here are `amazon`, `walmart`, `aliexpress`, and `shopify`.

**Done when:** you name the specific product, price, and store. A generic price range is not enough.

## Tips

- `search` returns product links or IDs. Pass one to `product` for full details, price, and rating.
- `walmart search` and `aliexpress search` cost 2 credits per call. Every other command here costs 1.
- `shopify products`, `shopify collections`, and `shopify store` take the store's domain (`allbirds.com`), not a search query.
- For Amazon search suggestions, use `stophy suggest "<keyword>" --source amazon`.

## See also

- [stophy-apps](../stophy-apps/SKILL.md): App Store and Google Play listings
- [stophy-places](../stophy-places/SKILL.md): local businesses and stays
