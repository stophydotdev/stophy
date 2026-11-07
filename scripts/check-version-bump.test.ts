import { expect, test } from "bun:test";
import { problems, versionIn } from "./check-version-bump";

const same = { base: "1.0.9", head: "1.0.9" };

test("a skill change needs a plugin version bump", () => {
  expect(problems(["skills/stophy/SKILL.md"], () => same)).toHaveLength(1);
  expect(problems(["skills/stophy/SKILL.md"], () => ({ base: "1.0.8", head: "1.0.9" }))).toEqual(
    [],
  );
  expect(problems(["docs/introduction.mdx"], () => same)).toEqual([]);
});

test("a PyPI README or summary change needs a version bump", () => {
  expect(problems(["sdk/packages/python/README.md"], () => same)).toHaveLength(1);
});

test("the plugin manifests share one version", () => {
  expect(
    problems([], (file) =>
      file === "gemini-extension.json" ? { base: "1.0.8", head: "1.0.8" } : same,
    ),
  ).toHaveLength(1);
});

test("versionIn reads JSON and TOML", () => {
  expect(versionIn('{\n  "version": "1.0.9",\n}')).toBe("1.0.9");
  expect(versionIn('[project]\nname = "stophy"\nversion = "1.2.2"\n')).toBe("1.2.2");
});
