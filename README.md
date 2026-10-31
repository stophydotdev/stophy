# Stophy

Web scraping API for AI agents. Search, video, social, jobs, places, shopping, apps, property and ads behind one key, with a price shown before every call. You pay only for answers that come back.

Try it without a key:

```bash
npx -y @stophy/cli web search "bun runtime" --limit 2
```

Everything you install to use Stophy lives in this repo.

| Folder               | What it is                                                  | Install                                      |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| [`sdk`](./sdk)       | TypeScript and Python clients                               | `npm install stophy` or `pip install stophy` |
| [`cli`](./cli)       | The `stophy` command                                        | `npm install -g @stophy/cli`                 |
| [`mcp`](./mcp)       | MCP server for your agent                                   | `npx -y @stophy/mcp`                         |
| [`skills`](./skills) | Agent skills, and the Claude Code, Cursor and Gemini plugin | `npx skills add stophydotdev/stophy`         |
| [`docs`](./docs)     | The pages at [docs.stophy.dev](https://docs.stophy.dev)     |                                              |

Get a key at [stophy.dev](https://stophy.dev). New accounts start with 1,000 free credits.
