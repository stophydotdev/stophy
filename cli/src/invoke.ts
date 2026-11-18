import { formatUsd } from "./account.js";
import { isAgentMode } from "./agent.js";
import { currentArgs, flagTokens } from "./argv.js";
import type { CatalogEndpoint } from "./catalog.js";
import { request } from "./client.js";
import { CliError } from "./errors.js";
import { parseCall } from "./flags.js";
import { isAgentControl, requestFor } from "./jobs.js";
import { type JsonRecord, type JsonValue, isJsonRecord, jsonRecord, readString } from "./json.js";
import { handleOutput, writeOutput } from "./output.js";
import { renderData } from "./render.js";
import { withSignup } from "./signup.js";
import { withSpinner } from "./spinner.js";

export async function runEndpoint(endpoint: CatalogEndpoint): Promise<void> {
  const tokens = flagTokens(currentArgs(), endpoint.id.split("."));
  const parsed = parseCall(tokens, endpoint.input);
  if (!parsed.ok) throw new CliError(parsed.message);
  if (endpoint.id === "agent") {
    const prompt = readString(parsed.call.body.prompt);
    if (
      prompt !== undefined &&
      isAgentControl(`agent.${prompt.trim()}`) &&
      !tokens.some((token) => token === "--prompt" || token.startsWith("--prompt="))
    ) {
      throw new CliError(
        `Put \`${prompt.trim()}\` right after \`stophy agent\`, or use --prompt to start a run.`,
      );
    }
  }

  const send = () =>
    request({ ...requestFor(endpoint, parsed.call.body), accept: "application/json" });
  const response = await withSignup(() =>
    isAgentMode() ? send() : withSpinner(`Calling ${endpoint.id.split(".").join(" ")}…`, send),
  );

  const body = jsonRecord.safeParse(response.json);
  if (!body.success) throw new CliError("Server returned an unexpected response shape.");
  const format =
    parsed.call.format === "text" && isAgentMode() && parsed.call.outputFile === undefined
      ? "raw"
      : parsed.call.format;
  if (format === "json" && response.costUsd !== null) {
    process.stderr.write(`cost: ${formatUsd(Number(response.costUsd))}\n`);
  }
  if (format === "text") {
    writeOutput(renderData(shownOf(payloadOf(body.data))), parsed.call.outputFile);
    return;
  }
  handleOutput(format === "raw" ? body.data : payloadOf(body.data), {
    output: parsed.call.outputFile,
  });
}

const COUNTERS = new Set(["success", "costUsd"]);

export function payloadOf(body: JsonRecord): JsonValue {
  const rest = Object.fromEntries(Object.entries(body).filter(([key]) => !COUNTERS.has(key)));
  return rest.data ?? rest;
}

function shownOf(payload: JsonValue): JsonValue {
  return isJsonRecord(payload) && isJsonRecord(payload.json) ? payload.json : payload;
}
