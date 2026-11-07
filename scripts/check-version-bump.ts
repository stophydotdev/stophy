import { $ } from "bun";

interface Shipped {
  files: RegExp;
  versionFile: string;
  why: string;
}

export const SHIPPED: readonly Shipped[] = [
  {
    files: /^(skills\/|\.claude-plugin\/|\.mcp\.json$)/u,
    versionFile: ".claude-plugin/plugin.json",
    why: "Claude Code caches the plugin by version, so users keep the old skills.",
  },
  {
    files: /^sdk\/packages\/python\/(README\.md|pyproject\.toml)$/u,
    versionFile: "sdk/packages/python/pyproject.toml",
    why: "PyPI shows the README and summary of the last published version.",
  },
];

export const MANIFESTS = [
  ".claude-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  "gemini-extension.json",
];

export const versionIn = (text: string) => /^\s*"?version"?\s*[:=]\s*"([^"]+)"/mu.exec(text)?.[1];

export const problems = (
  changed: readonly string[],
  versions: (file: string) => { base: string | undefined; head: string | undefined },
) => [
  ...SHIPPED.filter((rule) => changed.some((file) => rule.files.test(file)))
    .filter((rule) => {
      const { base, head } = versions(rule.versionFile);
      return base === head;
    })
    .map((rule) => `${rule.versionFile}: files it ships changed, so bump its version. ${rule.why}`),
  ...(new Set(MANIFESTS.map((file) => versions(file).head)).size > 1
    ? [`${MANIFESTS.join(", ")} must have the same version.`]
    : []),
];

if (import.meta.main) {
  const base = `origin/${process.env.GITHUB_BASE_REF || "main"}`;
  if (process.env.CI) {
    await $`git fetch --quiet --no-tags --depth=1 origin ${base.replace("origin/", "")}`.nothrow();
  }
  const changed = (await $`git diff --name-only ${base} HEAD`.text()).split("\n").filter(Boolean);
  const read = async (ref: string, file: string) =>
    versionIn((await $`git show ${ref}:${file}`.quiet().nothrow()).stdout.toString());
  const cache = new Map<string, { base: string | undefined; head: string | undefined }>();
  for (const file of [...SHIPPED.map((rule) => rule.versionFile), ...MANIFESTS]) {
    cache.set(file, { base: await read(base, file), head: versionIn(await Bun.file(file).text()) });
  }
  const found = problems(
    changed,
    (file) => cache.get(file) ?? { base: undefined, head: undefined },
  );
  for (const line of found) console.error(line);
  if (found.length > 0) process.exit(1);
}
