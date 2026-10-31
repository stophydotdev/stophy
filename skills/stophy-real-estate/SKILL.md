---
name: stophy-real-estate
description: |
  Get homes for sale, for rent, or sold from Zillow and Realtor.com: search by place, price, bedrooms and more, and read one home's details, estimate, history, taxes and schools. Use for "find homes for sale in", "what is this house worth", "apartments for rent in this city", "recently sold homes near", "homes with a pool", "what are the taxes on this house". For hotels, stays, and attractions use stophy-places. For local classifieds, including apartments and housing, use stophy-shopping.
metadata:
  author: stophy
  version: "4.0.2"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy real estate

Search homes for sale, for rent, or sold on Zillow and Realtor.com.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# US homes for sale, with filters
stophy zillow search "Austin, TX" --status forSale --minBedrooms 3 --hasPool --json -o .stophy/zillow.json

# rentals, newest first
stophy zillow search "Brooklyn, NY" --status forRent --sort newest --petsAllowed --json -o .stophy/rentals.json

# one home's price, details, and estimate, by ID or link from a search result
stophy zillow property "https://www.zillow.com/homedetails/123-Main-St-New-York-NY-10001/12345678_zpid/" --json -o .stophy/property.json

# Realtor.com homes for sale under a price, and one home's history, taxes and schools
stophy realtor search "Austin, TX" --maxPrice 600000 --minBedrooms 3 --json -o .stophy/realtor.json
stophy realtor property --propertyId 9916205223 --json -o .stophy/realtor-property.json
```

Run `stophy <source> --help` for every command. The sources here are `zillow` and `realtor`.

**Done when:** you name the specific address, price, and listing link. A generic price range for the area is not enough.

## Tips

- Search first to get a property link or ID, then run `property` on it for the full details. To point at one home, give its link or its id, never both: `--propertyUrl` or `--propertyId`.
- `zillow search` costs 2 credits per call. `zillow property`, `realtor search` and `realtor property` cost 1.
- `zillow search` takes `--status` (`forSale`, `forRent` or `sold`), price, bedroom, bathroom, size and lot filters, `--homeTypes`, `--daysOnZillow`, `--keywords` and `--sort`. It also takes yes-or-no filters such as `--hasPool`, `--hasGarage`, `--priceReduced` and `--openHouse`. Run `stophy zillow search --help` for every option.
- Search returns one page. Run the same command with `--page 2` and so on, until a page has no results. Each page costs the same again.
- `realtor search` takes `--status`, `--minPrice`, `--maxPrice`, bedroom, bathroom and size filters, `--homeTypes` and `--sort` (`relevance`, `newest`, `priceLow` or `priceHigh`), and `--page 2` for the next page.
- `realtor property` takes the `propertyId` or link from a search result: `--propertyUrl` or `--propertyId`, never both. It returns the home's history, taxes and schools.

## See also

- [stophy-places](../stophy-places/SKILL.md): hotels and attractions
- [stophy-shopping](../stophy-shopping/SKILL.md): Craigslist apartments and housing
