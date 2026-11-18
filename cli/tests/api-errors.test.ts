import { mkdirSync } from "node:fs";
import { afterAll, expect, test } from "bun:test";

const home = `/tmp/stophy-cli-api-errors-${process.pid}`;
mkdirSync(home, { recursive: true });
process.env.XDG_CONFIG_HOME = home;
process.env.CLAUDECODE = "1";
delete process.env.CI;
delete process.env.STOPHY_API_KEY;

const flat = (code: string, status: number, extra = {}) =>
  Response.json(
    { success: false, error: `${code} message`, code, retryable: false, ...extra },
    { status },
  );

const signupUrl = "https://stophy.dev/signup";
const requestId = "fb8eba5b-0aa8-4d66-ac0c-64b49eef7512";

const started = {
  success: true,
  data: {
    claimUrl: "https://stophy.dev/claim/abc",
    code: "c".repeat(40),
    expiresAt: "2099-01-01T00:00:00.000Z",
  },
};

const replies = new Map([
  [
    "/v1/free",
    flat("freeLimit", 429, { retryable: true, retryAfterSeconds: 3600, signupUrl, requestId }),
  ],
  ["/v1/needs-key", flat("apiKeyRequired", 401, { signupUrl, requestId })],
  ["/v1/changed", flat("sourceChanged", 502, { requestId })],
  ["/v1/busy", flat("profileBusy", 409, { retryable: true, retryAfterSeconds: 2, requestId })],
  ["/v1/signup", Response.json(started)],
]);

const seen: string[] = [];
const server = Bun.serve({
  port: 0,
  fetch(req) {
    const path = new URL(req.url).pathname;
    seen.push(path);
    return replies.get(path)?.clone() ?? flat("notFound", 404);
  },
});
process.env.STOPHY_BASE_URL = `http://127.0.0.1:${server.port}`;
afterAll(() => server.stop(true));

const call = async (path: string) => {
  const { request } = await import("../src/client.ts");
  return request({ method: "POST", path, accept: "application/json" });
};

test("a flat error keeps its code, retryability, retry delay, request id and fields", async () => {
  await expect(call("/v1/free")).rejects.toMatchObject({
    failure: {
      code: "freeLimit",
      message: "freeLimit message",
      retryable: true,
      retryAfterSeconds: 3600,
      requestId,
      signupUrl,
    },
  });
  await expect(call("/v1/changed")).rejects.toMatchObject({
    failure: { code: "sourceChanged", retryable: false },
  });
  await expect(call("/v1/busy")).rejects.toMatchObject({
    failure: { code: "profileBusy", retryable: true, retryAfterSeconds: 2 },
  });
});

test("a keyless freeLimit or apiKeyRequired answer starts a signup", async () => {
  const { withSignup } = await import("../src/signup.ts");
  const { clearStoredAuth } = await import("../src/config.ts");
  for (const path of ["/v1/free", "/v1/needs-key"]) {
    await clearStoredAuth();
    seen.length = 0;
    await expect(withSignup(() => call(path))).rejects.toMatchObject({
      failure: { code: "claimRequired" },
    });
    expect(seen).toEqual([path, "/v1/signup"]);
  }
});
