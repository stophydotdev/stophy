---
name: stophy-finance
description: |
  Get stock quotes, price history, company profiles, and crypto prices, including DEX pairs and wallet balances. Use for "what is this stock trading at", "how has this stock moved this year", "what is bitcoin's price", "what does this company look like on the market", "what is in this wallet". For general company news, not stock data, use stophy-web.
metadata:
  author: stophy
  version: "4.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy finance

Get stock quotes and history, company profiles, crypto coin prices, DEX pairs, and wallet balances.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# live quotes for one or more tickers
stophy finance quote --symbols AAPL,MSFT --json -o .stophy/quotes.json

# one stock's live price with its company profile and key stats
stophy finance stock AAPL --json -o .stophy/stock.json

# a stock's price over time
stophy finance history AAPL --from 2026-08-31 --json -o .stophy/history.json

# find a ticker and its recent news
stophy finance search tesla --json -o .stophy/finance-search.json

# a coin's price, supply, and details
stophy crypto coin bitcoin --json -o .stophy/coin.json

# top coins by market cap
stophy crypto coins --limit 20 --json -o .stophy/coins.json

# a wallet's balance and tokens
stophy crypto wallet "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" --chain ethereum --json -o .stophy/wallet.json
```

Run `stophy <source> --help` for every command. The sources here are `finance` and `crypto`.

**Done when:** you name the specific price, symbol, or balance with its timestamp. A stale or rounded figure is not enough.

## Tips

- `crypto coin` takes a coin's slug (`bitcoin`, not `BTC`). `finance quote`, `finance history` and `finance stock` take the ticker symbol.
- For a token that is not on a major exchange, use `crypto dex search`, then `crypto dex token` with its `--chain`.
- `finance history` takes `--from`, `--to` and `--interval`. `crypto history` takes `--from` and `--to`.

## See also

- [stophy-web](../stophy-web/SKILL.md): general news search
