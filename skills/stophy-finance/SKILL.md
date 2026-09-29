---
name: stophy-finance
description: |
  Get stock quotes, price history, company profiles, and crypto prices, including DEX pairs and wallet balances. Use for "what is this stock trading at", "how has this stock moved this year", "what is bitcoin's price", "what is trending in crypto right now", "what is in this wallet". For general company news, not stock data, use stophy-web.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy finance

Get stock quotes and history, crypto coin prices, DEX pairs, and wallet balances.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# live quotes for one or more tickers
stophy finance quote --symbols AAPL,MSFT -o .stophy/quotes.md

# a stock's price over time
stophy finance history AAPL --within month -o .stophy/history.md

# find a ticker and its recent news
stophy finance search tesla -o .stophy/finance-search.md

# a coin's price, supply, and details
stophy crypto coin bitcoin -o .stophy/coin.md

# what is trending in crypto now
stophy crypto trending -o .stophy/trending.md

# a wallet's balance and tokens
stophy crypto wallet --chain ethereum --wallet "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" -o .stophy/wallet.md
```

Run `stophy <source> --help` for every command. The sources here are `finance` and `crypto`.

**Done when:** you name the specific price, symbol, or balance with its timestamp. A stale or rounded figure is not enough.

## Tips

- `crypto coin` takes a coin's slug (`bitcoin`, not `BTC`). `finance quote` and `finance history` take the ticker symbol.
- For a token not yet on a major exchange, use `crypto dex search`. For newly launched pump.fun tokens, use `crypto pump coins`.

## See also

- [stophy-web](../stophy-web/SKILL.md): general news search
