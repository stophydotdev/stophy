import { expect, test } from "bun:test";
import { readdirSync } from "node:fs";

const WORKFLOWS = new URL("../.github/workflows/", import.meta.url);

interface Step {
  readonly uses: string;
  readonly run: string;
}

interface Job {
  readonly writesIdentity: boolean;
  readonly environment: string | undefined;
  readonly hasNeeds: boolean;
  readonly steps: readonly Step[];
}

interface Workflow {
  readonly writesIdentity: boolean;
  readonly jobs: ReadonlyMap<string, Job>;
}

const recordOf = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value))
    : {};

const textOf = (value: unknown): string => (typeof value === "string" ? value : "");

const stepOf = (value: unknown): Step => {
  const { uses, run } = recordOf(value);
  return { uses: textOf(uses), run: textOf(run) };
};

const jobOf = (value: unknown): Job => {
  const { permissions, environment, needs, steps } = recordOf(value);
  return {
    writesIdentity: recordOf(permissions)["id-token"] === "write",
    environment: typeof environment === "string" ? environment : undefined,
    hasNeeds: needs !== undefined,
    steps: Array.isArray(steps) ? steps.map(stepOf) : [],
  };
};

const workflowOf = (value: unknown): Workflow => {
  const { permissions, jobs } = recordOf(value);
  return {
    writesIdentity: recordOf(permissions)["id-token"] !== undefined,
    jobs: new Map(Object.entries(recordOf(jobs)).map(([name, job]) => [name, jobOf(job)])),
  };
};

const workflows = await Promise.all(
  readdirSync(WORKFLOWS)
    .filter((name) => name.endsWith(".yml"))
    .map(async (name) => {
      const text = await Bun.file(new URL(name, WORKFLOWS)).text();
      return [name, workflowOf(Bun.YAML.parse(text))] as const;
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

test("npm publishers upload a verified tarball without lifecycle scripts", () => {
  for (const { file, name, steps } of publishers) {
    const commands = steps.map(({ run }) => run).filter((run) => run !== "");
    const publish = commands.filter((command) => command.includes("npm publish"));
    if (name.endsWith("-npm")) {
      expect(publish, `${file}:${name}`).toHaveLength(1);
      expect(publish[0], `${file}:${name}`).toContain("--ignore-scripts");
      expect(publish[0], `${file}:${name}`).toContain(".tgz");
      expect(commands.join("\n"), `${file}:${name}`).toContain("sha256sum");
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
