# Docs token report

Tokens counted with `gpt-tokenizer` (o200k) over every `.mdx` page in `docs/`, measured on 2026-11-20. Rerun with `cd docs && bun scripts/tokens.ts`.

| Section                 | Pages before | Pages after | Tokens before | Tokens after | Change |
| ----------------------- | -----------: | ----------: | ------------: | -----------: | -----: |
| scrape/prebuilt-parsers |          114 |          10 |        131379 |        13469 |   -90% |
| api-reference           |          109 |         110 |         71644 |        32713 |   -54% |
| scrape                  |           27 |          14 |         41506 |        15140 |   -64% |
| (root)                  |            9 |           9 |         16145 |        10317 |   -36% |
| browser                 |            9 |           6 |         15995 |         6996 |   -56% |
| monitors                |            6 |           3 |         14248 |         5926 |   -58% |
| production              |            9 |           7 |         13654 |         5969 |   -56% |
| recipes                 |            5 |           5 |         10448 |         5381 |   -48% |
| search                  |            6 |           4 |         10315 |         4148 |   -60% |
| crawl                   |            5 |           3 |          8799 |         3469 |   -61% |
| batches                 |            4 |           2 |          7525 |         2022 |   -73% |
| extract                 |            3 |           1 |          5689 |         1943 |   -66% |
| account                 |            3 |           3 |          5333 |         3974 |   -25% |
| parse                   |            3 |           2 |          5102 |         2218 |   -57% |
| agent                   |            2 |           1 |          4713 |         2397 |   -49% |
| sdks                    |            2 |           0 |          3543 |            0 |  -100% |
| integrations            |            7 |           1 |          3204 |         1101 |   -66% |
| map                     |            2 |           1 |          2268 |          856 |   -62% |
| mcp                     |            2 |           0 |          1372 |            0 |  -100% |
| **Total**               |          327 |         182 |        372882 |       118039 |   -68% |

`mcp` and `sdks` pages merged into `install-mcp` and `sdks` (root). `integrations` went from 7 pages to 1.
