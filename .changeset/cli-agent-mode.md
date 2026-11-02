---
"@stophy/cli": patch
---

When an AI agent runs the CLI, or its output is piped, each call prints one line of JSON with `success`, `data`, `creditsUsed` and `requestId`, and a failed call prints `{"success":false,"error":{"code","message","retryable"}}` with the same exit code as before. With no key and no terminal, the CLI signs up for a free key and saves it. That key expires unless a person claims it, and `stophy claim` prints the link to give them. Every request sends `stophy-cli/<version>` and the agent and command names.
