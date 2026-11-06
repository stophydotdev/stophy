---
name: stophy-places
description: |
  Get places, hotels, flights and events: Google Maps, Tripadvisor and Yelp search and reviews, Google Hotels, Airbnb and Booking.com prices and reviews, Expedia hotel prices, Google Flights prices, and upcoming Luma events in a city. Use for "find coffee shops near", "what do reviews say about this restaurant", "what is the best hotel in", "find a hotel in", "find an Airbnb in", "what do guests say about this hotel", "flights from JFK to LAX", "what tech events are in San Francisco". Google Maps search and reviews work without an API key. For homes for sale or rent use stophy-real-estate.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy places

Find places, stays, flights and events, with prices and reviews.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). `google-maps` and `google-maps-reviews` work without a key, 50 calls a day, first page only. The rest need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no key needed: places near somewhere, and a place's reviews
stophy scrape "https://www.google.com/maps/search/coffee+shops+near+Union+Square+San+Francisco" --parser google-maps --json -o .stophy/places.json
stophy scrape "https://www.google.com/maps/place/Eiffel+Tower/@48.8584,2.2945,17z/data=!3m1!4b1!4m6!3m5!1s0x47e66e2964e34e2d:0x8ddca9ee380ef7e0" --parser google-maps-reviews

# key needed: restaurants, reviews, stays, flights and events
stophy scrape "https://www.yelp.com/search?find_desc=pizza&find_loc=Austin%2C+TX" --parser yelp-search
stophy scrape "https://www.tripadvisor.com/Hotel_Review-g186338-d187591-Reviews-The_Ritz_London_Hotel-London_England.html" --parser tripadvisor-reviews
stophy scrape "https://www.google.com/travel/search?q=hotels%20in%20Lisbon" --parser google-hotels --parserOptions '{"checkIn":"2026-12-10","checkOut":"2026-12-12"}'
stophy scrape "https://www.airbnb.com/s/Lisbon--Portugal/homes?checkin=2026-12-10&checkout=2026-12-12&adults=2" --parser airbnb-search
stophy scrape "https://www.booking.com/searchresults.html?ss=Lisbon&checkin=2026-12-10&checkout=2026-12-12&group_adults=2&no_rooms=1" --parser booking-search
stophy scrape "https://www.google.com/travel/flights?q=Flights%20to%20JFK%20from%20LHR%20on%202026-12-15" --parser google-flights
stophy scrape "https://luma.com/sf" --parser luma-events
```

**Done when:** you report each place, stay or flight with its name, price or rating, and link, as the output gives them.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `google-maps` (no key) | google.com/maps/search/ with a place after in, near or around | minRating, openNow, page |
| `google-maps-place` | a Google Maps place page | |
| `google-maps-reviews` (no key) | a Google Maps place page | sort, limit, cursor |
| `yelp-search` | yelp.com/search with both `find_desc` and `find_loc` | |
| `yelp-business`, `yelp-reviews` | yelp.com/biz/name | page |
| `tripadvisor-search` | tripadvisor.com/Search?q=... | location |
| `tripadvisor-place`, `tripadvisor-reviews` | a hotel, restaurant or attraction page | ratings, sort, page |
| `google-hotels` | google.com/travel/search?q=hotels in a place | checkIn, checkOut, adults, maxPrice, sort, cursor |
| `google-flights` | google.com/travel/flights?q=Flights to JFK from LHR on 2026-12-15 | returnDate, adults, cabin, stops, maxPrice |
| `airbnb-search` | airbnb.com/s/place/homes with checkin and checkout | minPrice, maxPrice, roomType, cursor |
| `airbnb-listing`, `airbnb-reviews` | airbnb.com/rooms/id | checkIn, checkOut, page |
| `booking-search` | booking.com/searchresults.html?ss=place | sort, cursor |
| `booking-hotel`, `booking-reviews` | booking.com/hotel/... | sort, cursor |
| `expedia-hotels` | expedia.com/Hotel-Search?destination=place | sort, page |
| `luma-events` | a city page, like luma.com/sf | category, cursor |
| `luma-event` | an event page, like luma.com/nighthack | |

## Tips

- Put dates, guests and filters in the page URL the way the site does.
- Every call here costs $0.002, except `google-maps-reviews`, which costs $0.002 per 10 reviews.

## See also

- [stophy-real-estate](../stophy-real-estate/SKILL.md): homes for sale and rent
- [stophy-social](../stophy-social/SKILL.md): what people post about a place
