# Stophy SDKs

Search, read, and act on the web. These are the typed Stophy clients for TypeScript and Python.

| Language                  | Install              | Guide                                        |
| ------------------------- | -------------------- | -------------------------------------------- |
| TypeScript and JavaScript | `npm install stophy` | [packages/typescript](./packages/typescript) |
| Python                    | `pip install stophy` | [packages/python](./packages/python)         |

```ts
import { Stophy } from "stophy";

const page = await new Stophy().scrape({ url: "https://example.com", formats: ["markdown"] });
```

Both clients are generated from the live API, so their methods and results match it. They read the key from `STOPHY_API_KEY`. Without a key they still work for every endpoint marked `keyless: true` in the [endpoint list](https://api.stophy.dev/openapi.json), which is `search`, `scrape`, `map` and `parse`. Every other call needs a key from [stophy.dev/signup](https://stophy.dev/signup).

The [TypeScript guide](https://docs.stophy.dev/sdks/typescript) and the [Python guide](https://docs.stophy.dev/sdks/python) on docs.stophy.dev cover each method. To change the SDKs, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Retries

The clients can retry reads and writes that support idempotency. For a supported write with an API key, the client uses one `Idempotency-Key` across all attempts. If a write may have run and cannot be replayed safely, the client stops. Look for `outcomeUnknown` in TypeScript or `outcome_unknown` in Python. Check whether the work finished before sending a new request.

## License

MIT
