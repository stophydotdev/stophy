---
name: stophy-places
description: |
  Get places, stays, and flights: Google Maps and Tripadvisor search and reviews, Airbnb listings and calendars, and Google Flights prices. Use for "find coffee shops near", "what do reviews say about this restaurant", "what is the best hotel in", "find a place to stay in", "is this Airbnb available", "flights from JFK to LAX". For homes for sale or rent use stophy-real-estate.
metadata:
  author: stophy
  version: "4.0.1"
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
stophy maps search --query coffee --location "Austin, TX" --limit 20 --json -o .stophy/maps.json

# one place's details, and its reviews
stophy maps place "ChIJrTLr-GyuEmsRBfy61i59si0" --json
stophy maps reviews "ChIJrTLr-GyuEmsRBfy61i59si0" --sort newest --limit 20 --json -o .stophy/reviews.json

# hotels, restaurants and attractions on Tripadvisor, one place's details, and its reviews
stophy tripadvisor search "Eiffel Tower" --type attractions --limit 10 --json -o .stophy/tripadvisor.json
stophy tripadvisor place 188151 --json
stophy tripadvisor reviews 188151 --ratings 1,2 --limit 20 --json -o .stophy/tripadvisor-reviews.json

# stays for a date range
stophy airbnb search "Lisbon, Portugal" --checkIn 2026-11-10 --checkOut 2026-11-15 --json -o .stophy/airbnb.json

# flight prices and times
stophy googletravel flights --origin JFK --destination LAX --departDate 2026-11-01 --json -o .stophy/flights.json
```

Run `stophy <source> --help` for every command. The sources here are `maps`, `tripadvisor`, `airbnb`, and `googletravel`.

**Done when:** you name the specific place, rating, price, or flight, with its source. A generic "there are several options" is not enough.

## Tips

- `maps search` needs both `--query` and `--location`. `maps place` and `maps reviews` take the `placeId` from a search result, not the name.
- Every command here costs 1 credit per call, including `googletravel flights`, `maps search`, `airbnb search` and all of Tripadvisor.
- `tripadvisor search` takes `--type` (`all`, `hotels`, `restaurants`, `attractions` or `geos`). `tripadvisor place` and `tripadvisor reviews` take the `placeId` or the link from a search result. `tripadvisor reviews` takes `--language` and `--ratings` (a list such as `1,2`), and `--cursor` for the next page.
- Run `airbnb calendar` on a listing to see which dates are open, then search with `--checkIn` and `--checkOut`.
- `airbnb search` returns up to about 110 listings, 18 to a page. Use `--cursor` for the next page. It returns `nights` and `pricePerNight`. `price` is the whole stay including fees, while `--minPrice` and `--maxPrice` are nightly rates before fees.
- `googletravel flights` takes `--cabin`, `--adults` and an optional `--returnDate`. Results show `cabin` and `tripType`. `price` is the total for all adults, both directions.

## See also

- [stophy-real-estate](../stophy-real-estate/SKILL.md): homes for sale or rent
