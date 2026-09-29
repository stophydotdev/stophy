---
name: stophy-real-estate
description: |
  Get homes for sale, for rent, or sold from Zillow, Redfin, Realtor.com, Rightmove, and ImmoScout24. Use for "find homes for sale in", "what is this house worth", "apartments for rent in this city", "recently sold homes near", "flats to rent in the UK or Germany". For hotels, stays, and attractions use stophy-places.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy real estate

Search homes for sale, for rent, or sold on US, UK, and German listing sites.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# US homes for sale, with filters
stophy zillow search --location "Austin, TX" --status forSale --bedrooms.min 3 -o .stophy/zillow.md

# the same search on Redfin and Realtor.com
stophy redfin search "Seattle, WA" --status forSale -o .stophy/redfin.md
stophy realtor search "Denver, CO" --status forSale -o .stophy/realtor.md

# UK and German listings
stophy rightmove search Manchester --status forSale -o .stophy/rightmove.md
stophy immoscout search Berlin --type apartmentRent -o .stophy/immoscout.md

# one home's price, details, and estimate, by ID from a search result
stophy zillow property "12345678_zpid" -o .stophy/property.md
```

Run `stophy <source> --help` for every command. The sources here are `zillow`, `redfin`, `realtor`, `rightmove`, and `immoscout`.

**Done when:** you name the specific address, price, and listing link. A generic price range for the area is not enough.

## Tips

- Search first to get a property ID, then run `property` or `listing` on it for price history and the estimate.
- The values for `--status`, `--homeTypes`, and `--propertyTypes` differ by site. Check `--help` before you filter.

## See also

- [stophy-places](../stophy-places/SKILL.md): stays, hotels, and attractions
