import { mkdirSync } from "node:fs";
import { expect, spyOn, test } from "bun:test";
import { Command } from "commander";
import type { JsonValue } from "../src/json.ts";

const home = `/tmp/stophy-cli-commands-${process.pid}`;
mkdirSync(home, { recursive: true });
process.env.XDG_CONFIG_HOME = home;
delete process.env.CI;

test("nested catalog commands reach the matching endpoint", async () => {
  const { registerDynamicCommands } = await import("../src/commands/dynamic.ts");
  const called: string[] = [];
  const program = new Command();
  program.exitOverride();
  registerDynamicCommands(
    program,
    [
      {
        id: "youtube.search",
        method: "POST",
        path: "/v1/youtube/search",
        costUsd: 0.001,
        keyless: false,
        input: {
          type: "object",
          properties: { query: { type: "string", minLength: 1 } },
          required: ["query"],
        },
      },
      {
        id: "youtube.comments",
        method: "POST",
        path: "/v1/youtube/comments",
        costUsd: 0.001,
        keyless: false,
        input: {
          type: "object",
          properties: { videoUrl: { type: "string" }, videoId: { type: "string" } },
          sendOne: ["videoUrl", "videoId"],
        },
      },
      {
        id: "youtube.transcript",
        method: "POST",
        path: "/v1/youtube/transcript",
        costUsd: 0.001,
        keyless: true,
        input: {
          type: "object",
          properties: { videoUrl: { type: "string" }, videoId: { type: "string" } },
          sendOne: ["videoUrl", "videoId"],
        },
      },
    ],
    async (endpoint) => {
      called.push(endpoint.id);
    },
  );

  const youtube = program.commands.find((command) => command.name() === "youtube");
  const search = youtube?.commands.find((command) => command.name() === "search");
  const help: string[] = [];
  search?.configureOutput({
    writeOut: (text) => {
      help.push(text);
    },
    writeErr: (text) => {
      help.push(text);
    },
  });
  search?.outputHelp();
  expect(help.join("")).toContain("Usage: stophy youtube search <query> [options]");
  expect(help.join("")).not.toContain("youtube.search");

  await program.parseAsync(["youtube", "search", "--query", "bun"], { from: "user" });
  await program.parseAsync(["youtube", "transcript", "https://youtu.be/M4TufsFlv_o"], {
    from: "user",
  });
  expect(called).toEqual(["youtube.search", "youtube.transcript"]);
});

test("sources show their summary, or their name when the server has none", async () => {
  const { registerDynamicCommands } = await import("../src/commands/dynamic.ts");
  const endpoint = {
    id: "reddit.search",
    summary: "Search Reddit posts",
    method: "POST" as const,
    path: "/v1/reddit/search",
    costUsd: 0.004,
    keyless: false,
    input: { type: "object", properties: {} },
  };
  const withSummary = new Command();
  registerDynamicCommands(withSummary, [endpoint], async () => {}, [
    { id: "reddit", summary: "Search posts, read threads, subreddits and users" },
  ]);
  expect(withSummary.helpInformation()).toContain(
    "Search posts, read threads, subreddits and users",
  );

  const without = new Command();
  registerDynamicCommands(without, [{ ...endpoint, summary: undefined }], async () => {});
  const help = without.helpInformation();
  expect(help).toMatch(/reddit +Reddit/u);
  expect(help).not.toContain("endpoints");

  const bare = new Command();
  registerDynamicCommands(bare, [endpoint], async () => {}, [{ id: "reddit", summary: "reddit" }]);
  expect(bare.helpInformation()).toMatch(/reddit +Search Reddit posts/u);
});

const reply = (status: number, body: JsonValue) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const apiKeyRequired = {
  success: false,
  error: {
    code: "apiKeyRequired",
    message: "This needs an API key.",
    retryable: false,
    signupUrl: "https://stophy.dev/signup",
    requestId: "req-1",
  },
};

test("an agent sees every field the server sent with an error", async () => {
  process.env.CLAUDECODE = "1";
  const { request, RequestError } = await import("../src/client.ts");
  const { writeFailure } = await import("../src/output.ts");
  const fetched = spyOn(globalThis, "fetch").mockResolvedValue(reply(401, apiKeyRequired));
  const written: string[] = [];
  const write = spyOn(process.stdout, "write").mockImplementation((chunk) => {
    written.push(String(chunk));
    return true;
  });
  try {
    try {
      await request({ method: "POST", path: "/v1/x", accept: "application/json" });
    } catch (error) {
      if (!(error instanceof RequestError)) throw error;
      writeFailure(error);
    }
  } finally {
    fetched.mockRestore();
    write.mockRestore();
  }
  expect(JSON.parse(written.join(""))).toEqual({
    success: false,
    error: {
      code: "apiKeyRequired",
      message: "This needs an API key.",
      retryable: false,
      signupUrl: "https://stophy.dev/signup",
    },
    requestId: "req-1",
  });
});

const captureStdout = async (run: () => Promise<void>) => {
  const written: string[] = [];
  const write = spyOn(process.stdout, "write").mockImplementation((chunk) => {
    written.push(String(chunk));
    return true;
  });
  try {
    await run();
  } finally {
    write.mockRestore();
  }
  return written.join("");
};

const CODE = "code-never-printed-0123456789abcdefghijklmnopq";
const CLAIM_URL = "https://stophy.dev/claim/abc123";
const KEY = `st_${"a".repeat(40)}`;
const EXPIRES_AT = "2099-01-01T00:00:00.000Z";

type Poll = "waiting" | "approved" | "gone";

const fakeServer = (poll: Poll) => {
  const seen: string[] = [];
  const fetched = spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const path = new URL(String(input)).pathname;
    const key = new Headers(init?.headers).get("authorization");
    seen.push(`${path}${key === null ? "" : " with key"}`);
    if (path === "/v1/signup") {
      return reply(201, {
        success: true,
        data: { claimUrl: CLAIM_URL, code: CODE, expiresAt: EXPIRES_AT },
      });
    }
    if (path === "/v1/signup/poll") {
      if (poll === "gone") {
        return reply(404, { error: { ...apiKeyRequired.error, code: "notFound" }, success: false });
      }
      return poll === "approved"
        ? reply(200, { success: true, data: { apiKey: KEY } })
        : reply(202, { success: true, data: { status: "waiting", claimUrl: CLAIM_URL } });
    }
    return key === null
      ? reply(429, { success: false, error: { ...apiKeyRequired.error, code: "apiKeyRequired" } })
      : reply(200, { success: true, data: {}, costUsd: 0.001, requestId: "req-2" });
  });
  return { seen, fetched };
};

const callWithSignup = async () => {
  const { request } = await import("../src/client.ts");
  const { withSignup } = await import("../src/signup.ts");
  return withSignup(() =>
    request({ method: "POST", path: "/v1/web/search", accept: "application/json" }),
  );
};

const agentWithoutKey = async () => {
  process.env.CLAUDECODE = "1";
  delete process.env.STOPHY_API_KEY;
  const { clearStoredAuth } = await import("../src/config.ts");
  await clearStoredAuth();
};

const claimRequired = {
  failure: {
    code: "claimRequired",
    claimUrl: CLAIM_URL,
    expiresAt: EXPIRES_AT,
    retryable: true,
  },
};

test("an agent with no key gets the claim link, and the code stays on disk", async () => {
  await agentWithoutKey();
  const { seen, fetched } = fakeServer("waiting");
  const { loadConfig } = await import("../src/config.ts");
  try {
    const failed = callWithSignup();
    await expect(failed).rejects.toMatchObject(claimRequired);
    await expect(failed).rejects.not.toHaveProperty("message", expect.stringContaining(CODE));
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual(["/v1/web/search", "/v1/signup"]);
  expect((await loadConfig()).pendingSignups?.map((entry) => entry.code)).toEqual([CODE]);
});

test("the next run polls the saved code once and gives the same link while it waits", async () => {
  const { seen, fetched } = fakeServer("waiting");
  try {
    await expect(callWithSignup()).rejects.toMatchObject(claimRequired);
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual(["/v1/web/search", "/v1/signup/poll"]);
});

test("once a person approves, the key is saved and the call goes through", async () => {
  const { seen, fetched } = fakeServer("approved");
  const { loadConfig } = await import("../src/config.ts");
  try {
    expect((await callWithSignup()).status).toBe(200);
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual(["/v1/web/search", "/v1/signup/poll", "/v1/web/search with key"]);
  expect(await loadConfig()).toMatchObject({ apiKey: KEY, pendingSignups: undefined });
});

test("an expired link is dropped and the agent signs up again", async () => {
  await agentWithoutKey();
  const first = fakeServer("waiting");
  try {
    await expect(callWithSignup()).rejects.toMatchObject(claimRequired);
  } finally {
    first.fetched.mockRestore();
  }
  const second = fakeServer("gone");
  try {
    await expect(callWithSignup()).rejects.toMatchObject(claimRequired);
  } finally {
    second.fetched.mockRestore();
  }
  expect(second.seen).toEqual(["/v1/web/search", "/v1/signup/poll", "/v1/signup"]);
});

test("a failed signup is the answer, with no second try", async () => {
  process.env.CLAUDECODE = "1";
  delete process.env.STOPHY_API_KEY;
  const { clearStoredAuth } = await import("../src/config.ts");
  const { request, RequestError } = await import("../src/client.ts");
  const { withSignup } = await import("../src/signup.ts");
  await clearStoredAuth();
  const seen: string[] = [];
  const fetched = spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const path = new URL(String(input)).pathname;
    seen.push(path);
    return path === "/v1/signup"
      ? reply(429, {
          success: false,
          error: { code: "rateLimited", message: "Slow down.", retryable: true },
        })
      : reply(429, { success: false, error: { ...apiKeyRequired.error, code: "apiKeyRequired" } });
  });
  try {
    const failed = withSignup(() =>
      request({ method: "POST", path: "/v1/web/search", accept: "application/json" }),
    );
    await expect(failed).rejects.toBeInstanceOf(RequestError);
    await expect(failed).rejects.toMatchObject({ failure: { code: "rateLimited" } });
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual(["/v1/web/search", "/v1/signup"]);
});

test("login and status never wait for a person when an agent runs them", async () => {
  await agentWithoutKey();
  const { registerLoginCommand } = await import("../src/commands/login.ts");
  const { registerStatusCommand } = await import("../src/commands/status.ts");
  const program = new Command();
  registerLoginCommand(program);
  registerStatusCommand(program);

  const before = await captureStdout(() => program.parseAsync(["status"], { from: "user" }));
  expect(JSON.parse(before)).toMatchObject({
    authenticated: false,
    source: "none",
    next: expect.stringContaining("stophy login"),
  });

  const { seen, fetched } = fakeServer("waiting");
  try {
    await expect(program.parseAsync(["login"], { from: "user" })).rejects.toMatchObject(
      claimRequired,
    );
    const saved = await captureStdout(() =>
      program.parseAsync(["login", "--api-key", KEY], { from: "user" }),
    );
    expect(JSON.parse(saved)).toEqual({ success: true, data: { authenticated: true } });
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual(["/v1/signup"]);
});

const rejectedKey = () =>
  spyOn(globalThis, "fetch").mockImplementation(async () =>
    reply(401, {
      success: false,
      error: "This API key is not valid or has expired.",
      code: "unauthorized",
      retryable: false,
      requestId: "req-9",
    }),
  );

test("a rejected stored key says to sign in again, a rejected env key says to replace it", async () => {
  const { request } = await import("../src/client.ts");
  const { setStoredApiKey, clearStoredAuth } = await import("../src/config.ts");
  await setStoredApiKey(KEY);
  const fetched = rejectedKey();
  try {
    await expect(
      request({ method: "GET", path: "/v1/limits", accept: "application/json" }),
    ).rejects.toMatchObject({
      message: expect.stringContaining("Run `stophy logout`, then `stophy login`"),
      failure: { code: "unauthorized", message: expect.stringContaining("stophy logout") },
    });
    process.env.STOPHY_API_KEY = KEY;
    await expect(
      request({ method: "GET", path: "/v1/limits", accept: "application/json" }),
    ).rejects.toThrow("STOPHY_API_KEY");
  } finally {
    delete process.env.STOPHY_API_KEY;
    fetched.mockRestore();
    await clearStoredAuth();
  }
});

test("status does not call a rejected key authenticated, and prints why on stderr", async () => {
  process.env.CLAUDECODE = "1";
  const { registerStatusCommand } = await import("../src/commands/status.ts");
  const { setStoredApiKey, clearStoredAuth } = await import("../src/config.ts");
  const program = new Command();
  registerStatusCommand(program);
  await setStoredApiKey(KEY);
  const fetched = rejectedKey();
  const written: string[] = [];
  const err = spyOn(process.stderr, "write").mockImplementation((chunk) => {
    written.push(String(chunk));
    return true;
  });
  process.exitCode = 0;
  try {
    const out = await captureStdout(() => program.parseAsync(["status"], { from: "user" }));
    expect(JSON.parse(out)).toMatchObject({
      authenticated: false,
      source: "stored",
      error: expect.stringContaining("not valid or has expired"),
      next: expect.stringContaining("stophy logout"),
    });
    expect(process.exitCode).toBe(1);
    expect(written.join("")).toContain("not valid or has expired");
  } finally {
    process.exitCode = 0;
    err.mockRestore();
    fetched.mockRestore();
    await clearStoredAuth();
  }
});

test("version reports stored credentials, not a login it has not checked", async () => {
  const { registerVersionCommand } = await import("../src/commands/version.ts");
  const { setStoredApiKey, clearStoredAuth } = await import("../src/config.ts");
  const program = new Command();
  registerVersionCommand(program);
  await setStoredApiKey(KEY);
  try {
    const out = await captureStdout(async () => {
      const log = spyOn(console, "log").mockImplementation((line) => {
        process.stdout.write(`${line}\n`);
      });
      try {
        await program.parseAsync(["version", "--json"], { from: "user" });
      } finally {
        log.mockRestore();
      }
    });
    expect(JSON.parse(out)).toEqual({
      version: expect.any(String),
      credentials: "stored",
      authenticated: true,
      source: "stored",
    });
  } finally {
    await clearStoredAuth();
  }
});

test("a key a header cannot carry is refused without printing the key", async () => {
  const { request } = await import("../src/client.ts");
  process.env.STOPHY_API_KEY = `${KEY}\nsecond line`;
  const fetched = spyOn(globalThis, "fetch");
  try {
    const failed = request({ method: "GET", path: "/v1/limits", accept: "application/json" });
    await expect(failed).rejects.toThrow("STOPHY_API_KEY");
    await expect(failed).rejects.not.toThrow(KEY);
    expect(fetched).not.toHaveBeenCalled();
  } finally {
    delete process.env.STOPHY_API_KEY;
    fetched.mockRestore();
  }
});

test("status marks a key rejected by a bare 401 as not authenticated", async () => {
  process.env.CLAUDECODE = "1";
  const { registerStatusCommand } = await import("../src/commands/status.ts");
  const { setStoredApiKey, clearStoredAuth } = await import("../src/config.ts");
  const program = new Command();
  registerStatusCommand(program);
  await setStoredApiKey(KEY);
  const fetched = spyOn(globalThis, "fetch").mockImplementation(
    async () => new Response(null, { status: 401 }),
  );
  const err = spyOn(process.stderr, "write").mockImplementation(() => true);
  try {
    const out = await captureStdout(() => program.parseAsync(["status"], { from: "user" }));
    expect(JSON.parse(out)).toMatchObject({ authenticated: false });
  } finally {
    process.exitCode = 0;
    err.mockRestore();
    fetched.mockRestore();
    await clearStoredAuth();
  }
});

test("status for a person at a terminal puts the rejection on stderr", async () => {
  const agentSignals = [
    "CLAUDECODE",
    "CODEX_SANDBOX",
    "CODEX_CI",
    "CODEX_THREAD_ID",
    "CURSOR_AGENT",
    "GEMINI_CLI",
    "OPENCODE_CLIENT",
    "OPENCODE",
    "AI_AGENT",
    "STOPHY_AGENT",
  ];
  const saved = agentSignals.map((name) => [name, process.env[name]] as const);
  for (const name of agentSignals) delete process.env[name];
  const { registerStatusCommand } = await import("../src/commands/status.ts");
  const { setStoredApiKey, clearStoredAuth } = await import("../src/config.ts");
  const program = new Command();
  registerStatusCommand(program);
  await setStoredApiKey(KEY);
  const fetched = rejectedKey();
  const tty = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
  Object.defineProperty(process.stdout, "isTTY", { value: true, configurable: true });
  const errors: string[] = [];
  const err = spyOn(console, "error").mockImplementation((line) => {
    errors.push(String(line));
  });
  const log = spyOn(console, "log").mockImplementation(() => {});
  try {
    await program.parseAsync(["status"], { from: "user" });
    expect(errors.join("\n")).toContain("not valid or has expired");
  } finally {
    process.exitCode = 0;
    if (tty) Object.defineProperty(process.stdout, "isTTY", tty);
    else Reflect.deleteProperty(process.stdout, "isTTY");
    err.mockRestore();
    log.mockRestore();
    fetched.mockRestore();
    await clearStoredAuth();
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    process.env.CLAUDECODE = "1";
  }
});

const pollServer = (answer: (code: string) => Response | Promise<Response>) => {
  const seen: string[] = [];
  const fetched = spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const path = new URL(String(input)).pathname;
    const key = new Headers(init?.headers).get("authorization");
    seen.push(`${path}${key === null ? "" : " with key"}`);
    if (path === "/v1/signup") {
      return reply(201, {
        success: true,
        data: { claimUrl: CLAIM_URL, code: CODE, expiresAt: EXPIRES_AT },
      });
    }
    if (path === "/v1/signup/poll") {
      const body = JSON.parse(String(init?.body ?? "{}"));
      return answer(String(body.code));
    }
    return key === null
      ? reply(429, { success: false, error: { ...apiKeyRequired.error, code: "apiKeyRequired" } })
      : reply(200, { success: true, data: {}, costUsd: 0.001, requestId: "req-2" });
  });
  return { seen, fetched };
};

const pending = (code: string) => ({ claimUrl: CLAIM_URL, code, expiresAt: EXPIRES_AT });

test("two signups started in parallel both stay, and either approval is collected", async () => {
  await agentWithoutKey();
  const { loadConfig, saveConfig } = await import("../src/config.ts");
  await saveConfig({
    ...(await loadConfig()),
    pendingSignups: [pending("first"), pending("second")],
  });
  const { seen, fetched } = pollServer((code) =>
    code === "first"
      ? reply(200, { success: true, data: { apiKey: KEY } })
      : reply(202, { success: true, data: { status: "waiting", claimUrl: CLAIM_URL } }),
  );
  try {
    expect((await callWithSignup()).status).toBe(200);
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual(["/v1/web/search", "/v1/signup/poll", "/v1/web/search with key"]);
  expect((await loadConfig()).apiKey).toBe(KEY);
});

test("a server error while polling keeps the signup instead of failing", async () => {
  await agentWithoutKey();
  const { loadConfig, saveConfig } = await import("../src/config.ts");
  await saveConfig({ ...(await loadConfig()), pendingSignups: [pending(CODE)] });
  const { seen, fetched } = pollServer(() =>
    reply(503, {
      success: false,
      error: { code: "internalError", message: "Busy.", retryable: true },
    }),
  );
  try {
    await expect(callWithSignup()).rejects.toMatchObject(claimRequired);
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual(["/v1/web/search", "/v1/signup/poll"]);
  expect((await loadConfig()).pendingSignups?.map((entry) => entry.code)).toEqual([CODE]);
});

test("a signup status this CLI does not know counts as still waiting", async () => {
  await agentWithoutKey();
  const { loadConfig, saveConfig } = await import("../src/config.ts");
  await saveConfig({ ...(await loadConfig()), pendingSignups: [pending(CODE)] });
  const { fetched } = pollServer(() =>
    reply(202, { success: true, data: { status: "reviewing", eta: 5 }, extra: true }),
  );
  try {
    await expect(callWithSignup()).rejects.toMatchObject(claimRequired);
  } finally {
    fetched.mockRestore();
  }
  expect((await loadConfig()).pendingSignups?.map((entry) => entry.code)).toEqual([CODE]);
});

test("a code another run already collected counts as approved, not expired", async () => {
  await agentWithoutKey();
  const { loadConfig, saveConfig, setStoredApiKey } = await import("../src/config.ts");
  await saveConfig({ ...(await loadConfig()), pendingSignups: [pending(CODE)] });
  const { fetched } = pollServer(async () => {
    await setStoredApiKey(KEY);
    return reply(404, { success: false, error: { ...apiKeyRequired.error, code: "notFound" } });
  });
  try {
    expect((await callWithSignup()).status).toBe(200);
  } finally {
    fetched.mockRestore();
  }
});

test("in CI with no key the CLI asks for STOPHY_API_KEY and starts no signup", async () => {
  await agentWithoutKey();
  process.env.CI = "true";
  const { seen, fetched } = pollServer(() =>
    reply(404, { success: false, error: { code: "notFound" } }),
  );
  try {
    await expect(callWithSignup()).rejects.toThrow("STOPHY_API_KEY");
  } finally {
    fetched.mockRestore();
    delete process.env.CI;
  }
  expect(seen).toEqual(["/v1/web/search"]);
});

test("a config the CLI can't write stops before a signup is spent", async () => {
  await agentWithoutKey();
  const { chmodSync } = await import("node:fs");
  const { getConfigPath } = await import("../src/config.ts");
  const { dirname } = await import("node:path");
  const { seen, fetched } = pollServer(() =>
    reply(404, { success: false, error: { code: "notFound" } }),
  );
  chmodSync(getConfigPath(), 0o400);
  chmodSync(dirname(getConfigPath()), 0o500);
  try {
    await expect(callWithSignup()).rejects.toThrow("Set STOPHY_API_KEY");
  } finally {
    chmodSync(dirname(getConfigPath()), 0o700);
    chmodSync(getConfigPath(), 0o600);
    fetched.mockRestore();
  }
  expect(seen).toEqual(["/v1/web/search"]);
});

test("a key piped to login --api-key is saved, not replaced by a signup", async () => {
  const configHome = `${home}/piped`;
  mkdirSync(configHome, { recursive: true });
  const run = Bun.spawn(["bun", "src/index.ts", "login", "--api-key"], {
    env: {
      ...process.env,
      XDG_CONFIG_HOME: configHome,
      STOPHY_API_KEY: "",
      STOPHY_BASE_URL: "http://127.0.0.1:9",
      STOPHY_NO_UPDATE_CHECK: "1",
    },
    stdin: new Blob([`${KEY}\n`]),
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(run.stdout).text();
  expect(await run.exited).toBe(0);
  expect(JSON.parse(out)).toEqual({ success: true, data: { authenticated: true } });
  const saved = await Bun.file(`${configHome}/stophy/config.json`).json();
  expect(saved.apiKey).toBe(KEY);
});

const flatError = (code: string, status: number, extra = {}, headers?: HeadersInit) =>
  Response.json(
    { success: false, error: `${code} message`, code, retryable: false, ...extra },
    { status, headers },
  );

const SIGNUP_URL = "https://stophy.dev/signup";
const REQUEST_ID = "fb8eba5b-0aa8-4d66-ac0c-64b49eef7512";

const apiReplies = new Map([
  [
    "/v1/free",
    flatError("freeLimit", 429, {
      retryable: true,
      retryAfterSeconds: 3600,
      signupUrl: SIGNUP_URL,
      requestId: REQUEST_ID,
    }),
  ],
  [
    "/v1/needs-key",
    flatError("apiKeyRequired", 401, { signupUrl: SIGNUP_URL, requestId: REQUEST_ID }),
  ],
  ["/v1/changed", flatError("sourceChanged", 502, { requestId: REQUEST_ID })],
  [
    "/v1/busy",
    flatError(
      "profileBusy",
      409,
      { retryable: true, retryAfterSeconds: 2, requestId: REQUEST_ID },
      { "X-Request-ID": "relay-id", "Retry-After": "99" },
    ),
  ],
  [
    "/v1/busy-until",
    flatError("busy", 503, { retryable: true }, { "Retry-After": "Fri, 01 Jan 2038 00:00:00 GMT" }),
  ],
  [
    "/v1/signup",
    Response.json({
      success: true,
      data: { claimUrl: CLAIM_URL, code: CODE, expiresAt: EXPIRES_AT },
    }),
  ],
]);

const withApi = async (run: (seen: string[]) => Promise<void>) => {
  await agentWithoutKey();
  const seen: string[] = [];
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const path = new URL(req.url).pathname;
      seen.push(path);
      return apiReplies.get(path)?.clone() ?? flatError("notFound", 404);
    },
  });
  const before = process.env.STOPHY_BASE_URL;
  process.env.STOPHY_BASE_URL = `http://127.0.0.1:${server.port}`;
  try {
    await run(seen);
  } finally {
    if (before === undefined) delete process.env.STOPHY_BASE_URL;
    else process.env.STOPHY_BASE_URL = before;
    server.stop(true);
  }
};

const callApi = async (path: string) => {
  const { request } = await import("../src/client.ts");
  return request({ method: "POST", path, accept: "application/json" });
};

test("a flat error keeps its code, retryability, retry delay, request id and fields", () =>
  withApi(async () => {
    await expect(callApi("/v1/free")).rejects.toMatchObject({
      failure: {
        code: "freeLimit",
        message: "freeLimit message Run `stophy login` to get a key.",
        retryable: true,
        retryAfterSeconds: 3600,
        requestId: REQUEST_ID,
        signupUrl: SIGNUP_URL,
      },
    });
    await expect(callApi("/v1/changed")).rejects.toMatchObject({
      failure: { code: "sourceChanged", retryable: false },
    });
    await expect(callApi("/v1/busy")).rejects.toMatchObject({
      failure: {
        code: "profileBusy",
        retryable: true,
        retryAfterSeconds: 2,
        requestId: REQUEST_ID,
      },
      message: `profileBusy message Retry after 2s.\nRequest id: ${REQUEST_ID}`,
    });
  }));

test("an HTTP-date retry header is displayed without a seconds suffix", () =>
  withApi(async () => {
    await expect(callApi("/v1/busy-until")).rejects.toMatchObject({
      message: "busy message Retry after Fri, 01 Jan 2038 00:00:00 GMT.",
    });
  }));

test("a keyless apiKeyRequired answer starts a signup", () =>
  withApi(async (seen) => {
    const { withSignup } = await import("../src/signup.ts");
    const { clearStoredAuth } = await import("../src/config.ts");
    await clearStoredAuth();
    await expect(withSignup(() => callApi("/v1/needs-key"))).rejects.toMatchObject({
      failure: { code: "claimRequired" },
    });
    expect(seen).toEqual(["/v1/needs-key", "/v1/signup"]);
  }));

test("a keyless freeLimit answer keeps its retry window and starts no signup", () =>
  withApi(async (seen) => {
    const { withSignup } = await import("../src/signup.ts");
    const { clearStoredAuth } = await import("../src/config.ts");
    for (const ci of [undefined, "true"]) {
      await clearStoredAuth();
      seen.length = 0;
      if (ci) process.env.CI = ci;
      try {
        await expect(withSignup(() => callApi("/v1/free"))).rejects.toMatchObject({
          failure: { code: "freeLimit", retryable: true, retryAfterSeconds: 3600 },
          message: expect.stringContaining("Retry after 3600s."),
        });
        await expect(withSignup(() => callApi("/v1/free"))).rejects.toThrow("stophy login");
      } finally {
        delete process.env.CI;
      }
      expect(seen).toEqual(["/v1/free", "/v1/free"]);
    }
  }));

const browserTask = {
  id: "browser.task",
  summary: "Click through a public website in a real browser",
  method: "POST" as const,
  path: "/v1/browser/task",
  keyless: false,
  input: { type: "object", properties: { goal: { type: "string" } }, required: ["goal"] },
};

const CDP_URL = "wss://cdp.test/s1?token=secret";

const ranInBrowser = {
  success: true,
  output: "",
  stdout: "",
  result: "Example Domain",
  stderr: "",
  exitCode: 0,
  killed: false,
  truncated: false,
  steps: [],
  cdpUrl: CDP_URL,
  liveViewUrl: "https://live.test/s1",
  interactiveLiveViewUrl: "https://live.test/s1?control=1",
  costUsd: 0,
  creditsUsed: 0,
  requestId: "req-run",
};

const browserServer = (execute: () => Response = () => reply(200, ranInBrowser)) => {
  const seen: [string, string, JsonValue][] = [];
  const fetched = spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const path = new URL(String(input)).pathname;
    const method = init?.method ?? "GET";
    seen.push([method, path, init?.body ? JSON.parse(String(init.body)) : null]);
    if (path === "/v1/browser") {
      return reply(200, { success: true, id: "s1", status: "active", cdpUrl: CDP_URL });
    }
    if (path === "/v1/browser/s1/execute") return execute();
    return reply(200, { success: true, sessionDurationMs: 3600, costUsd: 0.004, creditsUsed: 2 });
  });
  return { seen, fetched };
};

const browserProgram = async (endpoints: readonly (typeof browserTask)[] = [browserTask]) => {
  const { registerDynamicCommands } = await import("../src/commands/dynamic.ts");
  const { withBrowserRun } = await import("../src/browser.ts");
  const program = new Command();
  registerDynamicCommands(program, withBrowserRun(endpoints));
  return program;
};

const browserRun = async (args: readonly string[]) => {
  process.env.CLAUDECODE = "1";
  const { setCurrentArgs } = await import("../src/argv.ts");
  const program = await browserProgram();
  const words = ["browser", "run", ...args];
  setCurrentArgs(words);
  return captureStdout(() => program.parseAsync(words, { from: "user" }));
};

test("browser run opens a browser, runs the code and closes it, also when the run fails", async () => {
  const code = "return await page.title()";
  const ok = browserServer();
  try {
    await browserRun(["--code", code, "--timeout", "20"]);
  } finally {
    ok.fetched.mockRestore();
  }
  expect(ok.seen).toEqual([
    ["POST", "/v1/browser", { ttl: 80 }],
    ["POST", "/v1/browser/s1/execute", { code, timeout: 20 }],
    ["DELETE", "/v1/browser/s1", null],
  ]);

  const broken = browserServer(() =>
    reply(503, {
      success: false,
      error: { code: "internalError", message: "Busy.", retryable: true },
    }),
  );
  try {
    await expect(browserRun(["--code", code])).rejects.toThrow("Busy.");
  } finally {
    broken.fetched.mockRestore();
  }
  expect(broken.seen.map(([method, path]) => `${method} ${path}`)).toEqual([
    "POST /v1/browser",
    "POST /v1/browser/s1/execute",
    "DELETE /v1/browser/s1",
  ]);
});

test("browser run --id runs in that session and leaves it open", async () => {
  const { seen, fetched } = browserServer();
  try {
    await browserRun(["--id", "s1", "--prompt", "Read the title"]);
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual([["POST", "/v1/browser/s1/execute", { prompt: "Read the title" }]]);
});

test("browser run gives an agent one line with the result and the close's cost, and no session links", async () => {
  const { fetched } = browserServer();
  try {
    const out = await browserRun(["--code", "return await page.title()"]);
    expect(out.trim().split("\n")).toHaveLength(1);
    expect(JSON.parse(out)).toEqual({
      success: true,
      result: "Example Domain",
      costUsd: 0.004,
      requestId: "req-run",
    });
  } finally {
    fetched.mockRestore();
  }
});

test("browser run prints the error of a failed run and exits 1", async () => {
  const failed = {
    ...ranInBrowser,
    result: "",
    stderr: "TimeoutError: locator.click\n",
    exitCode: 1,
    error: "TimeoutError: locator.click",
  };
  const { fetched } = browserServer(() => reply(200, failed));
  try {
    const out = await browserRun(["--code", "await page.click('#gone')"]);
    expect(JSON.parse(out)).toEqual({
      success: true,
      stderr: "TimeoutError: locator.click\n",
      exitCode: 1,
      error: "TimeoutError: locator.click",
      costUsd: 0.004,
      requestId: "req-run",
    });
    expect(process.exitCode).toBe(1);
  } finally {
    process.exitCode = 0;
    fetched.mockRestore();
  }
});

test("browser run refuses both --code and --prompt, or neither, before any request", async () => {
  const fetched = spyOn(globalThis, "fetch");
  try {
    await expect(browserRun(["--code", "1", "--prompt", "Read it"])).rejects.toThrow(
      "Send only one of --code or --prompt.",
    );
    await expect(browserRun(["--language", "python"])).rejects.toThrow("Send --code or --prompt.");
    expect(fetched).not.toHaveBeenCalled();
  } finally {
    fetched.mockRestore();
  }
});

test("browser run sits next to the catalog's browser commands, and only there", async () => {
  const browser = (await browserProgram()).commands.find((command) => command.name() === "browser");
  expect(browser?.commands.map((command) => command.name())).toEqual(["run", "task"]);
  expect(browser?.helpInformation()).toMatch(
    /run +Run Playwright code or a prompt in a cloud browser, in one call/u,
  );
  const help = browser?.commands.find((command) => command.name() === "run")?.helpInformation();
  expect(help).toContain("--language <language>");
  expect(help).toContain("node, python or bash (default: node)");
  expect(help).toContain(
    `stophy browser run --code "await page.goto('https://example.com'); return await page.title()"`,
  );

  const search = { ...browserTask, id: "search", path: "/v1/search" };
  const plain = await browserProgram([search]);
  expect(plain.commands.map((command) => command.name())).toEqual(["search"]);
});
