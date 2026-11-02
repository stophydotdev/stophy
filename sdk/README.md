# Stophy SDKs

Give your agents the live web from TypeScript and Python.

| Language                  | Install              | Guide                                        |
| ------------------------- | -------------------- | -------------------------------------------- |
| TypeScript and JavaScript | `npm install stophy` | [packages/typescript](./packages/typescript) |
| Python                    | `pip install stophy` | [packages/python](./packages/python)         |

```ts
import { Stophy } from "stophy";

const result = await new Stophy().google.search({ query: "bun runtime" });
```

```python
from stophy import Stophy

result = Stophy().google.search(query="bun runtime")
```

Both work with no key, like every endpoint marked `keyless: true` in the [endpoint list](https://api.stophy.dev/v1/endpoints). Every other call needs a key from the [dashboard](https://stophy.dev/dashboard).

To change the SDKs, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
