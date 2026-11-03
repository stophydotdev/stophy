import { mkdirSync } from "node:fs";
import { expect, spyOn, test } from "bun:test";
import { Command } from "commander";
import type { JsonValue } from "../src/json.ts";

const home = `/tmp/stophy-cli-commands-${process.pid}`;
mkdirSync(home, { recursive: true });
process.env.XDG_CONFIG_HOME = home;

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
        credits: 1,
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
        credits: 1,
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
        credits: 1,
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
    credits: 2,
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

test("an agent with no key signs up through /v1/signup and sends a keyless call again once", async () => {
  process.env.CLAUDECODE = "1";
  delete process.env.STOPHY_API_KEY;
  const { request } = await import("../src/client.ts");
  const { withSignup } = await import("../src/commands/claim.ts");
  const seen: string[] = [];
  const fetched = spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const path = new URL(String(input)).pathname;
    const key = new Headers(init?.headers).get("authorization");
    seen.push(`${path} ${key ?? "no key"}`);
    if (path === "/v1/signup") {
      return reply(201, {
        success: true,
        data: { apiKey: `st_${"a".repeat(40)}`, expiresAt: "2026-11-10T00:00:00Z", credits: 100 },
      });
    }
    return key === null
      ? reply(429, { success: false, error: { ...apiKeyRequired.error, code: "freeLimit" } })
      : reply(200, { success: true, data: {}, creditsUsed: 1, requestId: "req-2" });
  });
  try {
    const response = await withSignup(() =>
      request({ method: "POST", path: "/v1/web/search", accept: "application/json" }),
    );
    expect(response.status).toBe(200);
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual([
    "/v1/web/search no key",
    "/v1/signup no key",
    `/v1/web/search Bearer st_${"a".repeat(40)}`,
  ]);
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

test("a failed signup is the answer, with no second try", async () => {
  process.env.CLAUDECODE = "1";
  delete process.env.STOPHY_API_KEY;
  const { clearStoredAuth } = await import("../src/config.ts");
  const { request, RequestError } = await import("../src/client.ts");
  const { withSignup } = await import("../src/commands/claim.ts");
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
      : reply(429, { success: false, error: { ...apiKeyRequired.error, code: "freeLimit" } });
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
  process.env.CLAUDECODE = "1";
  delete process.env.STOPHY_API_KEY;
  const { clearStoredAuth } = await import("../src/config.ts");
  const { registerLoginCommand } = await import("../src/commands/login.ts");
  const { registerStatusCommand } = await import("../src/commands/status.ts");
  await clearStoredAuth();
  const program = new Command();
  registerLoginCommand(program);
  registerStatusCommand(program);

  const before = await captureStdout(() => program.parseAsync(["status"], { from: "user" }));
  expect(JSON.parse(before)).toMatchObject({
    authenticated: false,
    source: "none",
    next: expect.stringContaining("stophy login"),
  });

  const seen: string[] = [];
  const fetched = spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    seen.push(new URL(String(input)).pathname);
    return reply(201, {
      success: true,
      data: { apiKey: `st_${"b".repeat(40)}`, expiresAt: "2026-11-10T00:00:00Z", credits: 100 },
    });
  });
  try {
    const out = await captureStdout(() => program.parseAsync(["login"], { from: "user" }));
    expect(JSON.parse(out)).toMatchObject({ success: true, data: { authenticated: true } });
  } finally {
    fetched.mockRestore();
  }
  expect(seen).toEqual(["/v1/signup"]);
});
