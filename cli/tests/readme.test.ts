import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test } from "bun:test";

const firstCommand = () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  const line = readme.split("\n").find((text) => text.startsWith("npx -y @stophy/cli "));
  if (line === undefined) throw new Error("README has no first CLI command");
  return line.replace("npx -y @stophy/cli ", "").match(/"[^"]*"|\S+/gu) ?? [];
};

test("the first command in the README runs and sends one search with two results", async () => {
  const home = `/tmp/stophy-cli-readme-${process.pid}`;
  mkdirSync(`${home}/stophy`, { recursive: true });
  const search = {
    id: "search",
    method: "POST",
    path: "/v1/search",
    keyless: true,
    input: {
      type: "object",
      properties: { query: { type: "string" }, limit: { type: "integer" } },
      required: ["query"],
    },
  };
  const catalog = { fetchedAt: new Date().toISOString(), endpoints: [search] };
  writeFileSync(`${home}/stophy/catalog.json`, JSON.stringify(catalog));
  const bodies: unknown[] = [];
  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      bodies.push(await req.json());
      return Response.json({ success: true, data: { web: [] } });
    },
  });
  const run = Bun.spawn(
    ["bun", "src/index.ts", ...firstCommand().map((arg) => arg.replaceAll('"', ""))],
    {
      env: {
        ...process.env,
        XDG_CONFIG_HOME: home,
        STOPHY_BASE_URL: `http://127.0.0.1:${server.port}`,
        STOPHY_NO_UPDATE_CHECK: "1",
      },
      stderr: "pipe",
      stdout: "pipe",
    },
  );
  const exit = await run.exited;
  server.stop(true);
  expect(await new Response(run.stderr).text()).toBe("");
  expect(exit).toBe(0);
  expect(bodies).toEqual([{ query: "bun runtime", limit: 2 }]);
});
