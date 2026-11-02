import type { Command } from "commander";
import { z } from "zod";
import { isAgentMode } from "../agent.js";
import { request } from "../client.js";
import { CliError } from "../errors.js";
import { setStoredApiKey } from "../config.js";
import { handleOutput, writeOutput } from "../output.js";

const claimResponse = z.object({
  success: z.literal(true),
  data: z.object({ claimUrl: z.string(), expiresAt: z.string() }),
});

export interface Signup {
  readonly credits: number;
  readonly expiresAt: string;
  readonly notice: string;
}

let signup: Signup | undefined;

export function signupResult(): Signup | undefined {
  return signup;
}

const signupResponse = z.object({
  data: z.object({ apiKey: z.string(), expiresAt: z.string(), credits: z.number() }),
});

export async function signUp(): Promise<void> {
  const response = await request({
    method: "POST",
    path: "/v1/signup",
    accept: "application/json",
  });
  const parsed = signupResponse.safeParse(response.json);
  if (!parsed.success) throw new CliError("Server returned an unexpected response shape.");
  const { apiKey, expiresAt, credits } = parsed.data.data;
  await setStoredApiKey(apiKey);
  signup = {
    credits,
    expiresAt,
    notice: `Signed up with ${credits} free credits. This key expires on ${expiresAt} unless a person claims it. Run \`stophy claim\` and give them the link.`,
  };
}

export function registerClaimCommand(program: Command) {
  program
    .command("claim")
    .description("Get a link for your person to keep this account")
    .action(async () => {
      const response = await request({
        method: "POST",
        path: "/v1/claim",
        accept: "application/json",
      });
      const parsed = claimResponse.safeParse(response.json);
      if (!parsed.success) throw new CliError("Server returned an unexpected response shape.");
      if (isAgentMode()) {
        handleOutput(response.json);
        return;
      }
      writeOutput(parsed.data.data.claimUrl);
      process.stderr.write(
        `Give this link to your person. It works until ${parsed.data.data.expiresAt}.\n`,
      );
    });
}
