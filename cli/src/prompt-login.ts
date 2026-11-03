import open from "open";
import prompts from "prompts";
import { z } from "zod";
import { startBrowserLogin } from "./browser-login.js";
import { green } from "./color.js";
import { getBrowserLoginUrl, loadConfig, resolveRuntimeConfig, saveConfig } from "./config.js";
import { loginCode } from "./login-code.js";

const answerSchema = z.string();

const err = (msg: string) => process.stderr.write(`${msg}\n`);

export async function prompt(question: string): Promise<string> {
  const { value } = await prompts({
    type: "text",
    name: "value",
    message: question,
  });
  return (answerSchema.safeParse(value).data ?? "").trim();
}

async function tryOpenBrowser(url: string): Promise<boolean> {
  try {
    await open(url);
    return true;
  } catch {
    return false;
  }
}

export async function doBrowserLogin(options?: { promptBeforeOpen?: boolean }) {
  const { baseUrl, frontendUrl } = await resolveRuntimeConfig();
  const pending = await startBrowserLogin(baseUrl);
  const { sessionId, codeChallenge } = pending;
  const loginUrl = getBrowserLoginUrl(frontendUrl, sessionId, codeChallenge);

  err("");
  err(green(loginUrl));
  err("");
  err(`Your code: ${loginCode(codeChallenge)}`);
  err("");
  if (options?.promptBeforeOpen !== false) {
    await prompt("Press Enter to open your browser...");
  }
  const opened = await tryOpenBrowser(loginUrl);
  if (!opened) {
    err("Could not open browser automatically. Please visit the URL above.");
  }
  err("Waiting for authorization in your browser...");

  const result = await pending.result;
  const current = await loadConfig();
  await saveConfig({
    ...current,
    apiKey: result.apiKey,
    baseUrl,
    frontendUrl,
  });
  err(green("✓ Login successful!"));
}
