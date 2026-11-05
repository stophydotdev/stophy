---
name: stophy-real-estate
description: |
  Get homes for sale, for rent or sold from Zillow and Realtor.com: search by place, price, bedrooms and more, and read one home's details, estimate, history, taxes and schools. Use for "find homes for sale in", "what is this house worth", "apartments for rent in this city", "recently sold homes near", "homes with a pool", "what are the taxes on this house". For hotels, stays and attractions use stophy-places. For local classifieds use stophy-shopping.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy real estate

Find homes and read their details.

**Prerequisite:** every parser here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# homes for sale in a city, on each site
stophy scrape "https://www.zillow.com/homes/San-Francisco,-CA_rb/" --parser zillow-search --json -o .stophy/homes.json
stophy scrape "https://www.realtor.com/realestateandhomes-search/Austin_TX" --parser realtor-search

# one home's details, estimate, history, taxes and schools
stophy scrape "https://www.zillow.com/homedetails/157-28th-Ave-San-Francisco-CA-94121/15088840_zpid/" --parser zillow-property
```

**Done when:** you list each home with its price, address and link as the output gives them.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `zillow-search` | zillow.com/homes/place_rb/ | status, minPrice, maxPrice, minBedrooms, page |
| `zillow-property` | zillow.com/homedetails/.../id_zpid/ | |
| `realtor-search` | realtor.com/realestateandhomes-search/City_ST | status, minPrice, maxPrice, minBedrooms, homeTypes, sort, page |
| `realtor-property` | realtor.com/realestateandhomes-detail/... | |

## Tips

- Send filters as options, like `--parserOptions '{"status":"forRent","maxPrice":3000}'`. `stophy parsers zillow --json` lists every option.
- `zillow-search` costs $0.003. Every other call here costs $0.0015.

## See also

- [stophy-places](../stophy-places/SKILL.md): hotels, stays and places nearby
