---
name: stophy-real-estate
description: |
  Get homes for sale, for rent, or sold from Zillow, Rightmove, and ImmoScout24. Use for "find homes for sale in", "what is this house worth", "apartments for rent in this city", "recently sold homes near", "flats to rent in the UK or Germany". For hotels, stays, and attractions use stophy-places.
metadata:
  author: stophy
  version: "4.0.0"
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
stophy zillow search "Austin, TX" --status forSale --minBedrooms 3 --json -o .stophy/zillow.json

# UK and German listings
stophy rightmove search Manchester --status forSale --json -o .stophy/rightmove.json
stophy immoscout search Berlin --type apartmentRent --json -o .stophy/immoscout.json

# one home's price, details, and estimate, by ID or link from a search result
stophy zillow property "https://www.zillow.com/homedetails/123-Main-St-New-York-NY-10001/12345678_zpid/" --json -o .stophy/property.json
```

Run `stophy <source> --help` for every command. The sources here are `zillow`, `rightmove`, and `immoscout`.

**Done when:** you name the specific address, price, and listing link. A generic price range for the area is not enough.

## Tips

- Search first to get a property link or ID, then run `property` or `listing` on it for the full details.
- `zillow search` costs 2 credits per call. Every other command here costs 1, including `rightmove search`, `immoscout search` and `zillow property`.
- The values for `--status` and `--type` differ by site. Check `--help` before you filter.

## See also

- [stophy-places](../stophy-places/SKILL.md): stays, hotels, and attractions
