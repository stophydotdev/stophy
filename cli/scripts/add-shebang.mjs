import { readFileSync, writeFileSync } from "node:fs";

const entry = new URL("../dist/index.js", import.meta.url);

writeFileSync(entry, `#!/usr/bin/env node\n${readFileSync(entry, "utf8")}`);
