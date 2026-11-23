---
"@stophy/cli": patch
---

When the CLI cannot read a reply, it now says it may be out of date and gives the upgrade command: `npm install -g @stophy/cli@latest`, or run the installer again. If the API sends `X-Stophy-Min-Cli-Version` and this CLI is older, every failing call says so, and a working call warns on stderr. A signup status the CLI does not know counts as still waiting instead of failing.
