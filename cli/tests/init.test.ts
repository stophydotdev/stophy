import { expect, spyOn, test } from "bun:test";
import { request, withRequestId } from "../src/client.ts";
import {
  type InitDependencies,
  mcpInstructions,
  runInit,
  skillsArgs,
} from "../src/commands/init.ts";

const MCP_URL = "https://mcp.stophy.dev/mcp";

function fake(overrides: Partial<InitDependencies> = {}) {
  const calls: string[][] = [];
  const dependencies: InitDependencies = {
    isLoggedIn: async () => false,
    browserLogin: async () => {
      calls.push(["browser-login"]);
    },
    runCommand: async (command, args) => {
      calls.push([command, ...args]);
    },
    commandExists: async () => true,
    confirm: async () => true,
    interactive: false,
    ...overrides,
  };
  return { calls, dependencies };
}

async function capture(run: () => Promise<void>) {
  const lines: string[] = [];
  const write = spyOn(process.stderr, "write").mockImplementation((chunk) => {
    lines.push(String(chunk));
    return true;
  });
  try {
    await run();
  } finally {
    write.mockRestore();
  }
  return lines.join("");
}

test("--all logs in, installs the skills and adds the MCP server, in that order", async () => {
  const { calls, dependencies } = fake();
  const output = await capture(() => runInit({ all: true }, dependencies));

  expect(calls).toEqual([
    ["browser-login"],
    [
      "npx",
      "-y",
      "skills",
      "add",
      "stophydotdev/stophy",
      "--agent",
      "*",
      "--skill",
      "*",
      "--yes",
      "--global",
    ],
    ["claude", "mcp", "add", "--transport", "http", "stophy", MCP_URL],
  ]);
  expect(output).toContain('stophy google search "latest bun release"');
});

test("a logged-in user is not sent to the browser", async () => {
  const { calls, dependencies } = fake({ isLoggedIn: async () => true });
  const output = await capture(() => runInit({ all: true }, dependencies));

  expect(calls.some((call) => call[0] === "browser-login")).toBe(false);
  expect(output).toContain("already logged in");
});

test("each skip flag leaves its step out", async () => {
  const { calls, dependencies } = fake();
  await capture(() =>
    runInit({ all: true, skipAuth: true, skipSkills: true, skipMcp: true }, dependencies),
  );

  expect(calls).toEqual([]);
});

test("without claude on the PATH it prints the command and edits nothing", async () => {
  const { calls, dependencies } = fake({ commandExists: async () => false });
  const output = await capture(() =>
    runInit({ all: true, skipAuth: true, skipSkills: true }, dependencies),
  );

  expect(calls).toEqual([]);
  expect(output).toContain(`claude mcp add --transport http stophy ${MCP_URL}`);
});

test("another agent gets its own instructions and no MCP command is run", async () => {
  const { calls, dependencies } = fake();
  const output = await capture(() =>
    runInit({ all: true, agent: "codex", skipAuth: true, skipSkills: true }, dependencies),
  );

  expect(calls).toEqual([]);
  expect(output).toContain(`codex mcp add stophy --url ${MCP_URL}`);
});

test("--agent narrows the skills install to one agent", () => {
  expect(skillsArgs({ all: true, agent: "codex" })).toEqual([
    "-y",
    "skills",
    "add",
    "stophydotdev/stophy",
    "--agent",
    "codex",
    "--skill",
    "*",
    "--yes",
    "--global",
  ]);
  expect(skillsArgs({})).toEqual(["-y", "skills", "add", "stophydotdev/stophy"]);
});

test("an interactive run asks first and respects a no", async () => {
  const asked: string[] = [];
  const { calls, dependencies } = fake({
    interactive: true,
    confirm: async (question) => {
      asked.push(question);
      return false;
    },
  });
  await capture(() => runInit({}, dependencies));

  expect(asked).toHaveLength(3);
  expect(calls).toEqual([]);
});

test("a failed step does not stop the others, and the run reports it", async () => {
  const { calls, dependencies } = fake({
    runCommand: async (command, args) => {
      calls.push([command, ...args]);
      if (command === "npx") throw new Error("offline");
    },
  });
  let message = "";
  const output = await capture(async () => {
    try {
      await runInit({ all: true, skipAuth: true }, dependencies);
    } catch (error) {
      message = error instanceof Error ? error.message : "";
    }
  });

  expect(calls.map((call) => call[0])).toEqual(["npx", "claude"]);
  expect(output).toContain("offline");
  expect(message).toBe("Setup did not finish: Skills.");
});

test("the manual snippet for an unknown agent is valid JSON", () => {
  const lines = mcpInstructions("cursor");
  expect(JSON.parse(lines[1] ?? "")).toEqual({
    mcpServers: { stophy: { url: MCP_URL } },
  });
});

test("withRequestId appends the id, or leaves the message alone", () => {
  expect(withRequestId("Bad input.", "abc-123")).toBe("Bad input.\nRequest id: abc-123");
  expect(withRequestId("Bad input.", null)).toBe("Bad input.");
});

test("an API error carries the request id from the header, then from the body", async () => {
  const reply = (headers: Record<string, string>, requestId?: string) => async () =>
    new Response(
      JSON.stringify({
        error: {
          code: "bad_request",
          retryable: false,
          message: "Nope.",
          requestId,
        },
      }),
      {
        status: 400,
        headers: { "content-type": "application/json", ...headers },
      },
    );
  const fetchSpy = spyOn(globalThis, "fetch");
  try {
    fetchSpy.mockImplementation(reply({ "X-Request-ID": "from-header" }, "from-body"));
    await expect(
      request({ method: "GET", path: "/v1/x", accept: "application/json" }),
    ).rejects.toThrow("Request id: from-header");
    fetchSpy.mockImplementation(reply({}, "from-body"));
    await expect(
      request({ method: "GET", path: "/v1/x", accept: "application/json" }),
    ).rejects.toThrow("Request id: from-body");
  } finally {
    fetchSpy.mockRestore();
  }
});
