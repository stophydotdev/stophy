---
"@stophy/cli": patch
---

A command from an older skill, such as `stophy web search "<query>" --limit 5`, now names the command to run, `stophy search '<query>' --limit 5`, and how to update the skills, instead of failing on `--limit` and printing the whole help.
