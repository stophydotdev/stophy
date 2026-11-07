# Stophy SDKs

Give your agents the live web from TypeScript and Python.

| Language                  | Install              | Guide                                        |
| ------------------------- | -------------------- | -------------------------------------------- |
| TypeScript and JavaScript | `npm install stophy` | [packages/typescript](./packages/typescript) |
| Python                    | `pip install stophy` | [packages/python](./packages/python)         |

```ts
import { Stophy } from "stophy";

const page = await new Stophy().scrape({ url: "https://example.com", formats: ["markdown"] });
```

```python
from stophy import Stophy

page = Stophy().scrape(url="https://example.com", formats=["markdown"])
```

Both work with no key, like every endpoint marked `keyless: true` in the [endpoint list](https://api.stophy.dev/v1/endpoints). Every other call needs a key from [stophy.dev/signup](https://stophy.dev/signup).

To change the SDKs, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
