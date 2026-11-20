import { execFileSync } from "node:child_process";
import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  onSuccess: async () => {
    execFileSync("tsc", ["--declaration", "--emitDeclarationOnly"], { stdio: "inherit" });
    copyFileSync("dist/index.d.ts", "dist/index.d.cts");
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
});
