import type { Command } from "commander";
import packageJson from "../../package.json" with { type: "json" };
import { z } from "zod";
import { green } from "../color.js";
import { resolveRuntimeConfig, setStoredApiKey, validateApiKey } from "../config.js";
import { CliError } from "../errors.js";
import { handleOutput } from "../output.js";
import { doBrowserLogin, prompt } from "../prompt-login.js";
import { canPrompt, ensureKey } from "../signup.js";

const err = (msg: string) => process.stderr.write(`${msg}\n`);

type LoginMode = "api-key" | "browser";

async function promptForLoginMode(): Promise<LoginMode> {
  err(`  @stophy/cli v${packageJson.version}`);
  err("  Give your agents the live web from your terminal");
  err("");
  err("Welcome! To get started, authenticate with your Stophy account.");
  err("");
  err("  1. Login with browser (recommended)");
  err("  2. Enter API key manually");
  err("");
  err("Tip: You can also set STOPHY_API_KEY environment variable");
  err("");

  for (;;) {
    const choice = await prompt("Enter choice [1/2]: ");
    if (choice === "1") return "browser";
    if (choice === "2") return "api-key";
    err(green("Enter 1 or 2."));
  }
}

async function resolveLoginMode(options: {
  apiKey?: boolean | string;
  browser?: boolean;
}): Promise<LoginMode> {
  if (options.browser && options.apiKey) {
    throw new CliError("Use either `--browser` or `--api-key`, not both.");
  }
  if (options.browser) return "browser";
  if (options.apiKey) return "api-key";
  return await promptForLoginMode();
}

async function handleApiKeyLogin(apiKeyOption?: boolean | string) {
  const given = z.string().safeParse(apiKeyOption);
  const apiKey = given.success
    ? validateApiKey(given.data)
    : validateApiKey(await prompt("Paste your Stophy API key: "));
  await setStoredApiKey(apiKey);
  err(green("✓ Login successful!"));
}

async function loginWithoutPrompt(apiKey: boolean | string | undefined) {
  const given = z.string().safeParse(apiKey);
  if (given.success) await setStoredApiKey(validateApiKey(given.data));
  else {
    const { apiKey: current, sessionCookie } = await resolveRuntimeConfig();
    if (!current && !sessionCookie) await ensureKey();
  }
  handleOutput({ success: true, data: { authenticated: true } });
}

export function registerLoginCommand(program: Command) {
  program
    .command("login")
    .description("Log in with your browser or an API key")
    .option("--browser", "Log in with your browser")
    .option("--api-key [key]", "Save an API key on this computer")
    .action(async (options: { apiKey?: boolean | string; browser?: boolean }) => {
      if (!canPrompt()) {
        await loginWithoutPrompt(options.apiKey);
        return;
      }
      const mode = await resolveLoginMode(options);
      if (mode === "browser") {
        await doBrowserLogin();
        return;
      }

      await handleApiKeyLogin(options.apiKey);
    });
}
