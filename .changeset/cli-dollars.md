---
"@stophy/cli": major
---

The CLI shows dollars, never credits. `stophy usage --json` returns `balanceUsd` and `costUsd` where it returned `balanceCredits` and `creditsUsed`, `stophy logs` has a `costUsd` column where it had `credits`, and a `--json` call prints `cost: $0.001` on stderr where it printed `credits used: 1`. `stophy usage`, `stophy status`, `stophy doctor`, `stophy endpoints` and `--help` show prices and balances like `$1.9876`. Scripts that read the old names must read the new ones.
