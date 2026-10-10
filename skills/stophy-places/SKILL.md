---
name: stophy-places
description: |
  Get places, hotels, and flights: Google Maps and Tripadvisor search and reviews, Google Hotels, Airbnb and Booking.com prices and reviews, and Google Flights prices. Use for "find coffee shops near", "what do reviews say about this restaurant", "what is the best hotel in", "find a hotel in", "find an Airbnb in", "what do guests say about this hotel", "flights from JFK to LAX". Google Maps search works without an API key. For homes for sale or rent use stophy-real-estate.
metadata:
  author: stophy
  version: "4.0.4"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy places

Search places on Google Maps and Tripadvisor, stays on Google Hotels, Airbnb and Booking.com, and flights on Google Flights.

**Prerequisite:** `stophy google maps search` works without a key, within a free limit. Every other command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# places by keyword and location, open now and rated 4 or more
stophy google maps search --query coffee --location "Austin, TX" --openNow --minRating 4 --json -o .stophy/maps.json

# one place's details, and its reviews
stophy google maps place "ChIJrTLr-GyuEmsRBfy61i59si0" --json
stophy google maps reviews "ChIJrTLr-GyuEmsRBfy61i59si0" --sort newest --json -o .stophy/reviews.json

# hotels, restaurants and attractions on Tripadvisor, one place's details, and its reviews
stophy tripadvisor search "Eiffel Tower" --type attractions --json -o .stophy/tripadvisor.json
stophy tripadvisor place 188151 --json
stophy tripadvisor reviews 188151 --ratings 1,2 --travelerTypes families --sort mostRecent --json -o .stophy/tripadvisor-reviews.json

# hotels with prices for a date range
stophy google hotels --query Lisbon --checkIn 2026-11-10 --checkOut 2026-11-15 --json -o .stophy/hotels.json

# flight prices and times
stophy google flights --origin JFK --destination LAX --departDate 2026-11-01 --json -o .stophy/flights.json

# Airbnb stays with prices for your dates, and one listing's reviews
stophy airbnb search --location "Lisbon, Portugal" --checkIn 2026-11-20 --checkOut 2026-11-23 --guests 2 --json -o .stophy/airbnb.json
stophy airbnb reviews 53888412 --json

# Booking.com hotels with prices, and one hotel's newest reviews
stophy booking search Lisbon --checkIn 2026-11-20 --checkOut 2026-11-23 --json -o .stophy/booking.json
stophy booking hotel reviews 15781550 --json
```

Run `stophy <source> --help` for every command. The sources here are `google` (Maps, Hotels and Flights), `tripadvisor`, `airbnb`, and `booking`.

**Done when:** you name the specific place, rating, price, or flight, with its source. A generic "there are several options" is not enough.

## Tips

- `google maps search` needs both `--query` and `--location`. `google maps place` and `google maps reviews` take the `placeId` from a search result, or the place link, not the name. To point at one place, give its link or its id, never both: `--placeUrl` or `--placeId`. `google maps reviews` ends with a `cursor` when there are more; pass it as `--cursor`.
- Every command here costs 1 credit per call, including `google flights`, `google maps search`, `google hotels` and all of Tripadvisor, Airbnb and Booking.com.
- `google maps search` takes `--openNow` and `--minRating` (`2` to `4.5`), and `--page 2` for the next page. Each result has its `hours`, `phone` and `website`.
- `tripadvisor search` takes `--type` (`all`, `hotels`, `restaurants`, `attractions` or `geos`). `tripadvisor place` and `tripadvisor reviews` take the `placeId` or the link from a search result. `tripadvisor reviews` takes `--language`, `--ratings` (a list such as `1,2`), `--travelerTypes`, `--months` and `--sort`, and `--page 2` for the next page.
- `google hotels` takes `--minRating`, `--hotelClass`, `--amenities`, `--propertyTypes`, `--freeCancellation` and `--sort`. It returns `price` per night and `totalPrice` for the stay. Page it with `--cursor`.
- `google flights` takes `--cabin`, `--adults`, `--stops` and an optional `--returnDate`. Results show `cabin` and `tripType`. `price` is the total for all adults, both directions.
- `airbnb search` needs `--location`, `--checkIn` and `--checkOut`, and takes `--guests`, `--minPrice`, `--maxPrice`, `--roomType` and `--currency`. `airbnb listing` and `airbnb reviews` take the `listingId` or link from a search result. Search pages with `--cursor`, and reviews with `--page`.
- `booking search` takes a place, and dates that default to tomorrow for one night. `--adults` counts everyone across `--rooms`, at most one room per adult. `booking hotel` and `booking hotel reviews` take the `hotelId` or link from a search result. Both page with `--cursor`.

## See also

- [stophy-real-estate](../stophy-real-estate/SKILL.md): homes for sale or rent
