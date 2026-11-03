import { $ } from "bun";

interface Rule {
  pattern: RegExp;
  message: string;
}

export const RULES: readonly Rule[] = [
  {
    message:
      "Use https://mcp.stophy.dev/mcp (sign in) or https://api.stophy.dev/mcp (key or no key).",
    pattern: /stophy\.dev\/mcp-oauth/u,
  },
  {
    message:
      "Stophy isn't listed in the Cursor Marketplace. Link cursor.directory/plugins/stophy instead.",
    pattern: /cursor\.com\/marketplace/u,
  },
];

const SKIPPED = /(^|\/)(CHANGELOG\.md|node_modules\/|bun\.lock)|^scripts\/check-text/u;

export const findings = (path: string, text: string) =>
  text
    .split("\n")
    .flatMap((line, index) =>
      RULES.filter((rule) => rule.pattern.test(line)).map(
        (rule) => `${path}:${index + 1}: ${rule.message}`,
      ),
    );

if (import.meta.main) {
  const paths = (await $`git ls-files`.text())
    .split("\n")
    .filter((path) => path !== "" && !SKIPPED.test(path));
  const found = (
    await Promise.all(paths.map(async (path) => findings(path, await Bun.file(path).text())))
  ).flat();
  for (const line of found) console.error(line);
  if (found.length > 0) process.exit(1);
}
