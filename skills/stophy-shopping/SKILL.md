---
name: stophy-shopping
description: |
  Get product listings, prices, and best sellers from Amazon, Walmart, AliExpress, and any Shopify store. Use for "what does this product cost", "find the cheapest", "what is selling well in this category", "does this store carry", "compare prices for this item". For app listings use stophy-apps. For places and local businesses use stophy-places.
metadata:
  author: stophy
  version: "3.0.0"
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
stophy amazon search --query "wireless earbuds" --sort priceLow -o .stophy/amazon.md

# one product's price and details
stophy amazon product B08N5WRWNW -o .stophy/product.md

# best sellers in a category
stophy amazon bestsellers electronics --limit 50 -o .stophy/bestsellers.md

# the same on Walmart and AliExpress
stophy walmart search "air fryer" --sort priceLow -o .stophy/walmart.md
stophy aliexpress search "phone case" --limit 60 -o .stophy/aliexpress.md

# a Shopify store's catalog
stophy shopify products allbirds.com --limit 50 -o .stophy/shopify.md
```

Run `stophy <source> --help` for every command. The sources here are `amazon`, `walmart`, `aliexpress`, and `shopify`.

**Done when:** you name the specific product, price, and store. A generic price range is not enough.

## Tips

- `search` returns product IDs. Pass one to `product` for full details, price, and rating.
- `shopify products`, `shopify collections`, and `shopify store` take the store's domain (`allbirds.com`), not a search query.

## See also

- [stophy-apps](../stophy-apps/SKILL.md): App Store and Google Play listings
- [stophy-places](../stophy-places/SKILL.md): local businesses and stays
