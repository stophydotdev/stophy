import { afterAll, beforeAll, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import ts from "typescript";

const packageRoot = join(import.meta.dir, "..");
const consumerRoot = mkdtempSync(join(tmpdir(), "stophy-ai-sdk-consumer-"));
let compilation: ReturnType<typeof compileConsumers>;

beforeAll(() => {
  execFileSync(process.execPath, ["run", "build"], { cwd: packageRoot });
  mkdirSync(join(consumerRoot, "node_modules", "@stophy"), { recursive: true });
  symlinkSync(packageRoot, join(consumerRoot, "node_modules", "@stophy", "ai-sdk"), "dir");
  symlinkSync(
    join(packageRoot, "node_modules", "ai"),
    join(consumerRoot, "node_modules", "ai"),
    "dir",
  );
  mkdirSync(join(consumerRoot, "node_modules", "@types"), { recursive: true });
  const bunTypes = createRequire(import.meta.resolve("@types/bun/package.json")).resolve(
    "bun-types/package.json",
  );
  symlinkSync(
    dirname(createRequire(bunTypes).resolve("@types/node/package.json")),
    join(consumerRoot, "node_modules", "@types", "node"),
    "dir",
  );
  const readme = readFileSync(join(packageRoot, "README.md"), "utf8");
  const example = readme.match(/```ts\n([\s\S]*?)```/)?.[1];
  if (example === undefined) throw new Error("README TypeScript example is missing");
  writeFileSync(join(consumerRoot, "consumer.cts"), consumer);
  writeFileSync(join(consumerRoot, "consumer.mts"), consumer);
  writeFileSync(join(consumerRoot, "readme.mts"), example);
  compilation = compileConsumers();
}, 30_000);

afterAll(() => {
  rmSync(consumerRoot, { recursive: true, force: true });
});

function compileConsumers() {
  const filenames = ["consumer.cts", "consumer.mts", "readme.mts"].map((name) =>
    join(consumerRoot, name),
  );
  const program = ts.createProgram(filenames, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.Node16,
    moduleResolution: ts.ModuleResolutionKind.Node16,
    strict: true,
    skipLibCheck: false,
    types: ["node"],
    typeRoots: [join(consumerRoot, "node_modules", "@types")],
    noEmitOnError: true,
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  return {
    diagnostics: diagnostics.map(
      (diagnostic) =>
        `${diagnostic.file?.fileName ?? ""}: TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`,
    ),
    emitSkipped: program.emit().emitSkipped,
  };
}

const consumer = `
import type { ToolSet } from "ai" with { "resolution-mode": "import" };
import { readPage, webSearch } from "@stophy/ai-sdk";

const tools = { webSearch: webSearch({ apiKey: "st_test" }), readPage: readPage({ apiKey: "st_test" }) } satisfies ToolSet;

for (const tool of Object.values(tools)) {
  if (!tool.inputSchema || !tool.execute) throw new Error("Tool is missing its schema or executor");
}
`;

test("CommonJS and ESM Node16 consumers and the README typecheck with library checks", () => {
  expect(compilation.diagnostics).toEqual([]);
  expect(compilation.emitSkipped).toBe(false);
});

test("CommonJS consumers run the built package", () => {
  execFileSync("node", [join(consumerRoot, "consumer.cjs")]);
});

test("ESM consumers run the built package", () => {
  execFileSync("node", [join(consumerRoot, "consumer.mjs")]);
});
