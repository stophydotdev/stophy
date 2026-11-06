---
name: stophy-lead-gen
description: |
  Build a list of local businesses or companies with their phone, website, public contact emails and LinkedIn details. Use for "find dentists in Berlin with their emails", "list coffee shops near this address with phone numbers", "get the contact email on this company's site", "how big is this company on LinkedIn". Only public business contact details from the company's own pages. For job openings use stophy-job-postings. For one person's social posts use stophy-social.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy lead gen

Turn a place and a business type into a contact list.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`), and `jq`. `google-maps` works without a key, 10 calls a minute and 50 a day. `emails`, `phone-numbers` and LinkedIn need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# 1. businesses near a place, with phone and website
stophy scrape "https://www.google.com/maps/search/coffee+shops+near+Union+Square+San+Francisco" --parser google-maps --json -o .stophy/places.json
jq -r '.json.results[] | [.name, .phone, .website] | @tsv' .stophy/places.json

# 2. the public emails and phone numbers on each website
stophy scrape "https://delahcoffee.com/" --parser emails
stophy scrape "https://www.hetzner.com/legal/legal-notice/" --parser phone-numbers

# 3. a company's size and details on LinkedIn
stophy scrape "https://www.linkedin.com/company/microsoft" --parser linkedin-company
```

`emails` and `phone-numbers` also read the site's contact and about pages, and list the pages each address was found on.

**Done when:** each lead has its name, and only the phone, website and email the output shows, with the page it came from.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `google-maps` (no key) | google.com/maps/search/ with a place after in, near or around | minRating, openNow, page |
| `google-maps-place` | a Google Maps place page | |
| `emails` | a company's website | |
| `phone-numbers` | a company's website | country |
| `linkedin-company` | linkedin.com/company/name | |
| `yelp-search` | yelp.com/search with `find_desc` and `find_loc` | |

## Tips

- Google Maps returns up to 20 places a page. For more, send `--parserOptions '{"page":2}'` (key needed), or split the area into neighborhoods.
- Filter at the source with `--parserOptions '{"minRating":4.5}'`.
- Every call here costs 1 credit.

## See also

- [stophy-places](../stophy-places/SKILL.md): reviews, hotels and events
- [stophy-social](../stophy-social/SKILL.md): a company's LinkedIn posts
