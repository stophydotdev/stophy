---
name: stophy-real-estate
description: Use for homes for sale, for rent or sold on Zillow and Realtor.com, like "homes for sale in", "what is this house worth", "apartments for rent under $3,000", "what are the taxes on this house".
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy real estate

Setup, keys and errors: [stophy](../stophy/SKILL.md). Every parser here needs a key.

```bash
stophy scrape "https://www.zillow.com/homes/San-Francisco,-CA_rb/" --parser zillow-search --parserOptions '{"status":"forRent","maxPrice":3000}' -o .stophy/homes.json --json
stophy scrape "https://www.realtor.com/realestateandhomes-search/Austin_TX" --parser realtor-search
stophy scrape "https://www.zillow.com/homedetails/157-28th-Ave-San-Francisco-CA-94121/15088840_zpid/" --parser zillow-property
```

| Parser | Page |
|---|---|
| `zillow-search` | zillow.com/homes/place_rb/ |
| `zillow-property` | zillow.com/homedetails/.../id_zpid/: details, estimate, history, taxes and schools |
| `realtor-search` | realtor.com/realestateandhomes-search/City_ST |
| `realtor-property` | realtor.com/realestateandhomes-detail/... |

Send filters as options: `status`, `minPrice`, `maxPrice`, `minBedrooms` and more. `stophy parsers zillow-search --json` lists them.

**Done when:** each home has its price, address and link from the output.

## Price

`zillow-search` costs $0.004. Every other call costs $0.001.
