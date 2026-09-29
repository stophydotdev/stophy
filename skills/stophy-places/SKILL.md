---
name: stophy-places
description: |
  Get places, hotels, attractions, stays, and flights: Google Maps search and reviews, Tripadvisor ratings, Airbnb listings and calendars, and Google Flights prices. Use for "find coffee shops near", "what do reviews say about this restaurant", "find a place to stay in", "is this Airbnb available", "flights from JFK to LAX". For homes for sale or rent use stophy-real-estate. For product prices use stophy-shopping.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy places

Search places on Google Maps and Tripadvisor, stays on Airbnb, and flights on Google Flights.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# places by keyword and location
stophy maps search coffee --near "Austin, TX" --limit 20 -o .stophy/maps.md

# reviews for one place
stophy maps reviews "ChIJrTLr-GyuEmsRBfy61i59si0" --sort newest --limit 20 -o .stophy/reviews.md

# hotels, restaurants, or attractions
stophy tripadvisor search "Eiffel Tower" --type attractions -o .stophy/tripadvisor.md

# stays for a date range
stophy airbnb search "Lisbon, Portugal" --checkIn 2026-11-10 --checkOut 2026-11-15 -o .stophy/airbnb.md

# flight prices and times
stophy googletravel flights --origin JFK --destination LAX --departDate 2026-11-01 -o .stophy/flights.md
```

Run `stophy <source> --help` for every command. The sources here are `maps`, `tripadvisor`, `airbnb`, and `googletravel`.

**Done when:** you name the specific place, rating, price, or flight, with its source. A generic "there are several options" is not enough.

## Tips

- `maps search` takes a plain place name. `maps place`, `maps reviews`, `tripadvisor place`, and `tripadvisor reviews` take the ID from a search result, not the name.
- Run `airbnb calendar` first to see which dates are open, then search with `--checkIn` and `--checkOut`.

## See also

- [stophy-real-estate](../stophy-real-estate/SKILL.md): homes for sale or rent
- [stophy-shopping](../stophy-shopping/SKILL.md): product prices
