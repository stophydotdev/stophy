# Stophy

Give your agents the live web. Try it with no key:

```bash
npx -y @stophy/cli web search "bun runtime" --limit 2
```

Everything you install to use Stophy lives in this repo.

| Folder               | What it is                                                  | Install                                         |
| -------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| [`sdk`](./sdk)       | TypeScript and Python clients                               | `npm install stophy` or `pip install stophy`    |
| [`cli`](./cli)       | The `stophy` command                                        | `curl -fsSL https://stophy.dev/install \| bash` |
| [`mcp`](./mcp)       | MCP server for your agent                                   | `npx -y @stophy/mcp`                            |
| [`skills`](./skills) | Agent skills, and the Claude Code, Cursor and Gemini plugin | `npx skills add stophydotdev/stophy`            |
| [`docs`](./docs)     | The pages at [docs.stophy.dev](https://docs.stophy.dev)     |                                                 |

Get a key at [stophy.dev/signup](https://stophy.dev/signup). New accounts start with $1.50 free.
