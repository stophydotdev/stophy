---
name: stophy-places
description: Use for places, travel and local leads, like "find coffee shops near", "what do reviews say about this restaurant", "find a hotel or Airbnb in", "flights from JFK to LAX", "tech events in San Francisco", "dentists in Berlin with their phone and email".
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy places

Setup, keys and errors: [stophy](../stophy/SKILL.md). Scrape the page a person would open, with the parser that reads it. Put dates, guests and filters in the URL the way the site does.

```bash
stophy scrape "https://www.google.com/maps/search/coffee+shops+near+Union+Square+San+Francisco" --parser google-maps -o .stophy/places.json --json
stophy scrape "https://www.airbnb.com/s/Lisbon--Portugal/homes?checkin=2026-12-10&checkout=2026-12-12&adults=2" --parser airbnb-search
stophy scrape "https://www.google.com/travel/flights?q=Flights%20to%20JFK%20from%20LHR%20on%202026-12-15" --parser google-flights
```

| Parser | Page |
|---|---|
| `google-maps` (no key) | google.com/maps/search/ with a place after in, near or around |
| `google-maps-place`, `google-maps-reviews` (no key) | a Google Maps place page |
| `yelp-search` | yelp.com/search with both `find_desc` and `find_loc` |
| `yelp-business`, `yelp-reviews` | yelp.com/biz/name |
| `tripadvisor-search` | tripadvisor.com/Search?q=... |
| `tripadvisor-place`, `tripadvisor-reviews` | a hotel, restaurant or attraction page |
| `google-hotels` | google.com/travel/search?q=hotels in a place; options `checkIn`, `checkOut`, `adults` |
| `google-flights` | google.com/travel/flights?q=Flights to JFK from LHR on 2026-12-15; options `returnDate`, `cabin`, `stops` |
| `airbnb-search`, `airbnb-listing`, `airbnb-reviews` | airbnb.com/s/place/homes with dates, airbnb.com/rooms/id |
| `booking-search`, `booking-hotel`, `booking-reviews` | booking.com/searchresults.html?ss=place, booking.com/hotel/... |
| `expedia-hotels` | expedia.com/Hotel-Search?destination=place |
| `luma-events`, `luma-event` | a city page like luma.com/sf, an event page |

- Write dates as `YYYY-MM-DD` and say the weekday when you report them. A vague place can mean several airports or districts, so name the one you searched.
- One empty search does not mean nothing is available. Widen the dates or the area once.
- Google Maps returns up to 20 places a page. `--parserOptions '{"minRating":4.5}'` filters at the source, and `{"page":2}` (key needed) gets more.

## Leads

For a list of local businesses with contacts, read the places, then each website:

```bash
jq -r '.json.results[] | [.name, .phone, .website] | @tsv' .stophy/places.json
stophy scrape "https://www.hetzner.com/legal/legal-notice/" --parser emails
stophy scrape "https://www.hetzner.com/legal/legal-notice/" --parser phone-numbers
stophy scrape "https://www.linkedin.com/company/microsoft" --parser linkedin-company
```

`emails` and `phone-numbers` also read the site's contact and about pages, and name the page each one came from. Report only public business contacts.

**Done when:** each place, stay, flight or lead has its name, price or rating, and link from the output.

## Price

$0.001 a call, except `google-maps-reviews`: $0.001 per 10 reviews.
