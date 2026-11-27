import { expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { z } from "zod";

const WORKFLOWS = new URL("../.github/workflows/", import.meta.url);

const permissions = z.record(z.string(), z.string()).optional();

const job = z
  .object({
    permissions,
    environment: z.string().optional(),
    needs: z.union([z.string(), z.array(z.string())]).optional(),
    steps: z.array(z.object({ uses: z.string().default(""), run: z.string().default("") })),
  })
  .transform(({ permissions: granted, environment, needs, steps }) => ({
    writesIdentity: granted?.["id-token"] === "write",
    environment,
    hasNeeds: needs !== undefined,
    steps,
  }));

const workflow = z
  .object({ permissions, jobs: z.record(z.string(), job) })
  .transform(({ permissions: granted, jobs }) => ({
    writesIdentity: granted?.["id-token"] !== undefined,
    jobs: new Map(Object.entries(jobs)),
  }));

const workflows = await Promise.all(
  readdirSync(WORKFLOWS)
    .filter((name) => name.endsWith(".yml"))
    .map(async (name) => {
      const text = await Bun.file(new URL(name, WORKFLOWS)).text();
      return [name, workflow.parse(Bun.YAML.parse(text))] as const;
    }),
);

const publishers = workflows.flatMap(([file, { jobs }]) =>
  [...jobs]
    .filter(([, { writesIdentity }]) => writesIdentity)
    .map(([name, job]) => ({ file, name, ...job })),
);

const BUILDS = /\b(install|build|bun|bunx|uv|pip|pnpm|yarn|npx|make|cargo)\b/;

test("only publisher jobs hold the publishing identity", () => {
  expect(publishers.map(({ file, name }) => `${file}:${name}`).sort()).toEqual([
    "publish.yml:publish-ai-sdk-npm",
    "publish.yml:publish-sdk-npm",
    "publish.yml:publish-sdk-python",
    "pypi.yml:publish-langchain-stophy",
  ]);
  for (const [file, { writesIdentity }] of workflows) expect(writesIdentity, file).toBe(false);
});

test("a publisher job checks out nothing and installs or builds nothing", () => {
  for (const { file, name, steps, hasNeeds } of publishers) {
    const where = `${file}:${name}`;
    expect(hasNeeds, where).toBe(true);
    for (const { uses, run } of steps) {
      expect(uses, where).not.toMatch(/actions\/checkout|setup-bun|setup-uv/);
      expect(run, where).not.toMatch(BUILDS);
    }
  }
});

test("npm publishers check the tarball hash and run no lifecycle scripts", () => {
  for (const { file, name, steps } of publishers) {
    const commands = steps.map(({ run }) => run).filter((run) => run !== "");
    const publish = commands.filter((command) => command.includes("npm publish"));
    if (name.endsWith("-npm")) {
      expect(publish, `${file}:${name}`).toHaveLength(1);
      expect(publish[0], `${file}:${name}`).toContain("--ignore-scripts");
      expect(commands.join("\n"), `${file}:${name}`).toContain("sha256sum --check");
    }
  }
});

test("the registry bindings keep their environment", () => {
  const environments = Object.fromEntries(
    publishers.map(({ name, environment }) => [name, environment]),
  );
  expect(environments["publish-langchain-stophy"]).toBe("pypi");
  expect(environments["publish-sdk-python"]).toBeUndefined();
});
