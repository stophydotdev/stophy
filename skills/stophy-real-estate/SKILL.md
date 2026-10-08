---
name: stophy-real-estate
description: |
  Get homes for sale, for rent, or sold from Zillow: search by place, price, bedrooms and more, and read one home's details and estimate. Use for "find homes for sale in", "what is this house worth", "apartments for rent in this city", "recently sold homes near", "homes with a pool". For hotels, stays, and attractions use stophy-places.
metadata:
  author: stophy
  version: "4.0.1"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy real estate

Search homes for sale, for rent, or sold on Zillow.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# US homes for sale, with filters
stophy zillow search "Austin, TX" --status forSale --minBedrooms 3 --hasPool --json -o .stophy/zillow.json

# rentals, newest first
stophy zillow search "Brooklyn, NY" --status forRent --sort newest --petsAllowed --json -o .stophy/rentals.json

# one home's price, details, and estimate, by ID or link from a search result
stophy zillow property "https://www.zillow.com/homedetails/123-Main-St-New-York-NY-10001/12345678_zpid/" --json -o .stophy/property.json
```

Run `stophy zillow --help` for every command.

**Done when:** you name the specific address, price, and listing link. A generic price range for the area is not enough.

## Tips

- Search first to get a property link or ID, then run `property` on it for the full details. To point at one home, give its link or its id, never both: `--propertyUrl` or `--propertyId`.
- `zillow search` and `zillow property` cost 2 credits per call.
- `zillow search` takes `--status` (`forSale`, `forRent` or `sold`), price, bedroom, bathroom, size and lot filters, `--homeTypes`, `--daysOnZillow`, `--keywords` and `--sort`. It also takes yes-or-no filters such as `--hasPool`, `--hasGarage`, `--priceReduced` and `--openHouse`. Run `stophy zillow search --help` for every option.
- Search returns one page. Run the same command with `--page 2` and so on, until a page has no results. Each page costs 2 credits again.

## See also

- [stophy-places](../stophy-places/SKILL.md): hotels and attractions
