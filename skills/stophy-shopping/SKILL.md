---
name: stophy-shopping
description: |
  Get product data: search Amazon by keyword, sort and price range, read one product's price and details, see Amazon best sellers, compare prices on Google Shopping, search TikTok Shop, eBay and Facebook Marketplace, and read a store's Trustpilot reviews. Use for "find the cheapest", "how much does this cost on Amazon", "best selling air fryers", "compare prices for", "what is this product's rating", "find a used one on eBay", "is this store legit". For homes use stophy-real-estate. For web results about a product use stophy-web.
metadata:
  author: stophy
  version: "4.0.3"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy shopping

Search products and read prices and details on Amazon, Google Shopping, TikTok Shop, eBay and Facebook Marketplace, and read what customers say about a store on Trustpilot.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# products by keyword
stophy amazon search "air fryer" --json -o .stophy/amazon.json

# the cheapest first, inside a price range
stophy amazon search "air fryer" --sort priceLow --minPrice 30 --maxPrice 100 --json -o .stophy/cheap.json

# one product's price and details, by ID or link from a search result
stophy amazon product B08N5WRWNW --json -o .stophy/product.json

# the best sellers in a category, and what people search for
stophy amazon bestsellers electronics --json
stophy amazon suggest "air fryer" --json

# the same product across stores
stophy google shopping "air fryer" --json -o .stophy/shopping.json

# TikTok Shop products by keyword
stophy tiktok shop search "gummies" --json

# used items on eBay, cheapest with shipping first, and one item
stophy ebay search "nintendo switch oled" --condition used --sort priceLow --json -o .stophy/ebay.json
stophy ebay item 820221984535 --json

# Facebook Marketplace listings near a city, under a price
stophy facebook marketplace search --query bike --location "Austin, Texas" --maxPrice 300 --json

# what customers say about a store, low ratings from the last 3 months
stophy trustpilot company reviews stripe.com --ratings 1,2 --datePublished last3Months --json
```

Run `stophy <source> --help` for every command. The sources here are `amazon`, `google`, `tiktok`, `ebay`, `facebook`, and `trustpilot`.

**Done when:** you name the specific product, its price, and its link. A generic "prices vary" is not enough.

## Tips

- `amazon search`, `amazon product`, `amazon bestsellers` and `google shopping` cost 2 credits per call. `amazon suggest`, every TikTok Shop command, and all of eBay, Facebook Marketplace and Trustpilot cost 1. Run a search only when you need the list.
- `--sort` on `amazon search` takes `relevance`, `priceLow`, `priceHigh`, `avgCustomerReview`, `newest` or `bestSelling`. `avgCustomerReview` puts the highest rated first. It does not mean most reviewed. `--minPrice`, `--maxPrice`, `--minRating`, `--brand` and `--category` narrow the results. `--country` picks the store.
- Search first to get a product ID or link, then run `product` on it for the full details. To point at one product, give its link or its id, never both: `--productUrl` or `--productId`.
- Search returns one page. Run the same command with `--page 2`, `--page 3` and so on, until a page has no results, and keep the other options the same. Each page costs 2 credits again.
- `tiktok shop product` and `tiktok shop reviews` take a product link or id, and `tiktok shop products` lists a seller's products by `--shopUrl` or `--shopId`. TikTok Shop search and seller lists page with `--cursor`.
- `ebay search` takes `--condition`, `--auctionsOnly`, `--minPrice`, `--maxPrice` and `--sort`. `--sort priceLow` puts the lowest `totalPrice`, the price plus shipping, first. Page it with `--page`.
- `facebook marketplace search` needs `--query` and `--location`, a city or ZIP code, and takes `--minPrice`, `--maxPrice` and `--sort`. It returns one page.
- `trustpilot company reviews` takes a company's domain, and `--ratings`, `--language`, `--datePublished`, `--verifiedOnly` and `--search`. It pages with `--page`, up to 10. `trustpilot search` finds a company by name.

## See also

- [stophy-web](../stophy-web/SKILL.md): web results about a product
- [stophy-video](../stophy-video/SKILL.md): TikTok videos
