---
"@stophy/cli": patch
---

When an AI agent runs the CLI, or its output is piped, each call prints one line of JSON with `success`, `data`, `creditsUsed` and `requestId`, and a failed call prints `{"success":false,"error":{...},"requestId"}` with every field the server sent, such as `signupUrl`, and the same exit code as before. With no key, the CLI starts a signup and asks a person to approve it. At a terminal it prints the link and waits for the approval. With no terminal it prints the link as a `claimRequired` error, keeps the pending signup in its config, and collects the key on the next run. A keyless call that the server refuses for want of a key does the same. `stophy status` and `stophy login` print one line of JSON and never wait for a prompt. Every request sends `stophy-cli/<version>` and the agent and command names.
