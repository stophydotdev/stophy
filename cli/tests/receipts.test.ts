import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, expect, test } from "bun:test";

const home = mkdtempSync(join(tmpdir(), "stophy-receipts-"));
afterAll(() => rmSync(home, { recursive: true, force: true }));

const scrape = {
  id: "scrape",
  method: "POST",
  path: "/v1/scrape",
  keyless: true,
  input: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
};

const ID = { "x-request-id": "req-abc" };
const KEY = "st_test";
const priced = { ...ID, "x-cost-usd": "0.001" };
const success = (headers: Record<string, string> = priced, extra = {}) =>
  Response.json({ success: true, data: { markdown: "hi" }, costUsd: 0.001, ...extra }, { headers });

async function run(answer: () => Response, args: string[]) {
  mkdirSync(`${home}/stophy`, { recursive: true });
  writeFileSync(
    `${home}/stophy/catalog.json`,
    JSON.stringify({ fetchedAt: new Date().toISOString(), endpoints: [scrape] }),
  );
  const server = Bun.serve({ port: 0, fetch: answer });
  const child = Bun.spawn(["bun", "src/index.ts", "scrape", "https://a.test", ...args], {
    env: {
      ...process.env,
      XDG_CONFIG_HOME: home,
      STOPHY_API_KEY: KEY,
      STOPHY_BASE_URL: `http://127.0.0.1:${server.port}`,
      STOPHY_NO_UPDATE_CHECK: "1",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exit, out, err] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  server.stop(true);
  return { exit, out, err };
}

test("--raw keeps the request id of a successful call", async () => {
  const { out } = await run(() => success(), ["--raw"]);
  expect(JSON.parse(out)).toEqual({
    success: true,
    data: { markdown: "hi" },
    costUsd: 0.001,
    requestId: "req-abc",
  });
});

test("a request id the body already carries wins over the header", async () => {
  const { out } = await run(() => success(priced, { requestId: "from-body" }), ["--raw"]);
  expect(JSON.parse(out).requestId).toBe("from-body");
});

test("--raw written to a file carries the request id too", async () => {
  const file = `${home}/raw/out.json`;
  await run(() => success(), ["--raw", "-o", file]);
  expect(JSON.parse(readFileSync(file, "utf8")).requestId).toBe("req-abc");
});

test("the one-line agent output carries the request id", async () => {
  const { out } = await run(() => success(), []);
  expect(JSON.parse(out)).toEqual({
    success: true,
    data: { markdown: "hi" },
    costUsd: 0.001,
    requestId: "req-abc",
  });
});

test("--json prints the request id after the cost, on stderr", async () => {
  const { out, err } = await run(() => success(), ["--json"]);
  expect(JSON.parse(out)).toEqual({ markdown: "hi" });
  expect(err).toBe("cost: $0.001\nrequest id: req-abc\n");
});

test("a call with no request id header prints none", async () => {
  const { err } = await run(() => success({ "x-cost-usd": "0.001" }), ["--json"]);
  expect(err).toBe("cost: $0.001\n");
});

test("a request ID that contains the active API key is omitted on success and failure", async () => {
  const headers = { "x-request-id": `req-${KEY}` };
  const ok = await run(() => success(headers), ["--raw"]);
  const failed = await run(
    () => Response.json({ error: "Unauthorized" }, { status: 401, headers }),
    [],
  );
  expect(ok.exit).toBe(0);
  expect(failed.exit).toBe(1);
  expect(ok.out + ok.err + failed.out + failed.err).not.toContain(KEY);
});

test("a failed call writes its message and request id to stderr and the JSON to stdout", async () => {
  const { exit, out, err } = await run(
    () =>
      Response.json(
        { success: false, error: "The page changed", code: "sourceChanged", retryable: false },
        { status: 502, headers: ID },
      ),
    [],
  );
  expect(exit).toBe(1);
  expect(err).toBe("The page changed\nRequest id: req-abc\n");
  expect(JSON.parse(out)).toEqual({
    success: false,
    error: { code: "sourceChanged", retryable: false, message: "The page changed" },
    requestId: "req-abc",
  });
});

test("a long failure reaches stderr and stdout whole before the CLI exits", async () => {
  const message = "The page changed. ".repeat(20_000);
  const { exit, out, err } = await run(
    () =>
      Response.json(
        { success: false, error: message, code: "sourceChanged", retryable: false },
        { status: 502, headers: ID },
      ),
    [],
  );
  expect(exit).toBe(1);
  expect(err).toBe(`${message}\nRequest id: req-abc\n`);
  expect(JSON.parse(out).error.message).toBe(message);
});

test("a failed call with -o still explains itself on stderr and writes no file", async () => {
  const file = `${home}/failed/out.json`;
  const { exit, err } = await run(
    () =>
      Response.json(
        { success: false, error: "The page changed", code: "sourceChanged", retryable: false },
        { status: 502, headers: ID },
      ),
    ["--json", "-o", file],
  );
  expect(exit).toBe(1);
  expect(err).toContain("Request id: req-abc");
  expect(existsSync(file)).toBe(false);
});

const UPGRADE = "npm install -g @stophy/cli@latest";

test("an answer that is not the API's JSON says so, with its status, request id and the upgrade command", async () => {
  const { exit, err } = await run(
    () =>
      new Response("<html>gateway</html>", { headers: { ...priced, "content-type": "text/html" } }),
    [],
  );
  expect(exit).toBe(1);
  expect(err).toStartWith("Server returned an unexpected response shape (status 200).");
  expect(err).toContain(UPGRADE);
  expect(err).toEndWith("\nRequest id: req-abc\n");
});

test("a server that names a newer minimum version tells a failing call to upgrade", async () => {
  const { exit, err } = await run(
    () =>
      Response.json(
        { success: false, error: "Try later", code: "busy", retryable: true },
        { status: 503, headers: { ...ID, "x-stophy-min-cli-version": "99.0.0" } },
      ),
    [],
  );
  expect(exit).toBe(1);
  expect(err).toContain("Try later");
  expect(err).toContain("older than the minimum (v99.0.0)");
  expect(err).toContain(UPGRADE);
});

test("a working call under a newer minimum version still answers, and warns on stderr", async () => {
  const { exit, out, err } = await run(
    () => success({ ...priced, "x-stophy-min-cli-version": "99.0.0" }),
    ["--raw"],
  );
  expect(exit).toBe(0);
  expect(JSON.parse(out).data).toEqual({ markdown: "hi" });
  expect(err).toContain(UPGRADE);
});

test("a minimum version that is not a version prints nothing", async () => {
  const { err } = await run(
    () => success({ ...priced, "x-stophy-min-cli-version": "99.invalid" }),
    ["--raw"],
  );
  expect(err).toBe("");
});

test("a minimum version this CLI meets prints nothing", async () => {
  const { err } = await run(
    () => success({ ...priced, "x-stophy-min-cli-version": "1.0.0" }),
    ["--raw"],
  );
  expect(err).toBe("");
});

test("a reply with fields this CLI does not know, and none it once required, is read", async () => {
  const { exit, out } = await run(
    () =>
      Response.json({
        success: true,
        data: { markdown: "hi", future: { nested: [1, 2] } },
        futureTop: "x",
      }),
    ["--raw"],
  );
  expect(exit).toBe(0);
  expect(JSON.parse(out)).toEqual({
    success: true,
    data: { markdown: "hi", future: { nested: [1, 2] } },
    futureTop: "x",
  });
});

test("an output file that cannot be written fails with its path and prints no cost", async () => {
  const { exit, err } = await run(() => success(), ["--json", "-o", "/proc/nope/out.json"]);
  expect(exit).toBe(1);
  expect(err).toContain("Could not write /proc/nope/out.json");
  expect(err).not.toContain("cost:");
});
