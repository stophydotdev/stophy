import { $ } from "bun";

type Decision = { kind: "exists" } | { kind: "new" } | { kind: "behind"; highest: string };

const parts = (version: string) => version.split("-")[0].split(".").map(Number);

const isHigher = (left: string, right: string) => {
  const [a, b] = [parts(left), parts(right)];
  const index = a.findIndex((part, at) => part !== b[at]);
  return index !== -1 && a[index] > b[index];
};

export const decide = (
  version: string,
  live: readonly string[],
  everPublished: readonly string[],
): Decision => {
  if (live.includes(version)) return { kind: "exists" };
  const highest = everPublished.reduce<string | undefined>(
    (top, next) => (top === undefined || isHigher(next, top) ? next : top),
    undefined,
  );
  return highest === undefined || isHigher(version, highest)
    ? { kind: "new" }
    : { kind: "behind", highest };
};

const npmJson = async (pkg: string, field: string): Promise<unknown[]> => {
  const result = await $`npm view ${pkg} ${field} --json`.quiet().nothrow();
  return result.exitCode === 0 ? [JSON.parse(result.stdout.toString())].flat() : [];
};

if (import.meta.main) {
  const [pkg, version] = process.argv.slice(2);
  if (pkg === undefined || version === undefined) {
    throw new Error("Usage: bun scripts/npm-version.ts <package> <version>");
  }
  const live = (await npmJson(pkg, "versions")).map(String);
  const ever = Object.keys(Object.assign({}, ...(await npmJson(pkg, "time")))).filter((key) =>
    /^\d/u.test(key),
  );
  const decision = decide(version, live, ever);
  if (decision.kind === "behind") {
    console.error(
      `${pkg}@${version} is not higher than ${decision.highest}, the highest version npm has ever had. Bump it above that.`,
    );
    process.exit(1);
  }
  console.log(`exists=${decision.kind === "exists"}`);
}
