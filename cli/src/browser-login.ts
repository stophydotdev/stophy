import { createHash, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { CliError } from "./errors.js";
import { deviceName } from "./login-code.js";

const initFailureSchema = z.object({ error: z.string().optional() });

const statusSchema = z.object({
  apiKey: z.string().optional(),
  status: z.string().optional(),
});

export interface BrowserLoginResult {
  apiKey: string;
}

export interface BrowserLoginSession {
  codeChallenge: string;
  result: Promise<BrowserLoginResult>;
  sessionId: string;
}

export async function startBrowserLogin(
  baseUrl: string,
  timeoutMs = 10 * 60 * 1000,
): Promise<BrowserLoginSession> {
  const sessionId = randomUUID();
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  const start = (device: string | undefined) =>
    fetch(new URL("/api/cli/init", `${baseUrl}/`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        device === undefined
          ? { session_id: sessionId, code_challenge: codeChallenge }
          : { session_id: sessionId, code_challenge: codeChallenge, device_name: device },
      ),
    }).catch((err: Error) => {
      throw new CliError(`Could not reach Stophy API: ${err.message}`);
    });

  const device = deviceName();
  let initRes = await start(device);
  if (initRes.status === 400 && device !== undefined) initRes = await start(undefined);

  if (!initRes.ok) {
    const failure = initFailureSchema.safeParse(await initRes.json().catch(() => ({})));
    throw new CliError(
      (failure.success ? failure.data.error : undefined) ?? "Failed to start browser login.",
    );
  }

  const result = new Promise<BrowserLoginResult>((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const poll = async () => {
      if (Date.now() >= deadline) {
        reject(new CliError("Browser login timed out. Try `stophy login --browser` again."));
        return;
      }

      try {
        const res = await fetch(new URL("/api/cli/status", `${baseUrl}/`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            code_verifier: codeVerifier,
          }),
        });
        const data = statusSchema.parse(await res.json());

        if (data.status === "complete") {
          if (!data.apiKey) {
            reject(new CliError("Authorization completed but no API key was returned."));
            return;
          }
          resolve({ apiKey: data.apiKey });
          return;
        }

        if (data.status === "denied") {
          reject(new CliError("Authorization denied."));
          return;
        }

        if (data.status === "expired") {
          reject(
            new CliError("Browser login session expired. Try `stophy login --browser` again."),
          );
          return;
        }
      } catch {}

      setTimeout(poll, 2000);
    };

    setTimeout(poll, 2000);
  });

  return { codeChallenge, result, sessionId };
}
