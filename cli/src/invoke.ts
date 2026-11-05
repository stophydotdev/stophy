import { currentArgs, flagTokens } from "./argv.js";
import type { CatalogEndpoint } from "./catalog.js";
import { request } from "./client.js";
import { CliError } from "./errors.js";
import { parseCall } from "./flags.js";
import { requestFor } from "./jobs.js";
import { type JsonRecord, type JsonValue, isJsonRecord, jsonRecord } from "./json.js";
import { handleOutput, writeOutput } from "./output.js";
import { renderData } from "./render.js";
import { withSpinner } from "./spinner.js";

export async function runEndpoint(endpoint: CatalogEndpoint): Promise<void> {
  const parsed = parseCall(flagTokens(currentArgs(), endpoint.id.split(".")), endpoint.input);
  if (!parsed.ok) throw new CliError(parsed.message);

  const response = await withSpinner(`Calling ${endpoint.id.split(".").join(" ")}…`, () =>
    request({ ...requestFor(endpoint, parsed.call.body), accept: "application/json" }),
  );

  const body = jsonRecord.safeParse(response.json);
  if (!body.success) throw new CliError("Server returned an unexpected response shape.");
  if (parsed.call.format === "json" && response.creditsUsed !== null) {
    process.stderr.write(`credits used: ${response.creditsUsed}\n`);
  }
  if (parsed.call.format === "text") {
    writeOutput(renderData(shownOf(payloadOf(body.data))), parsed.call.outputFile);
    return;
  }
  handleOutput(parsed.call.format === "raw" ? body.data : payloadOf(body.data), {
    output: parsed.call.outputFile,
  });
}

const COUNTERS = new Set(["success", "creditsUsed"]);

export function payloadOf(body: JsonRecord): JsonValue {
  const rest = Object.fromEntries(Object.entries(body).filter(([key]) => !COUNTERS.has(key)));
  const only = Object.keys(rest).length === 1 ? rest.data : undefined;
  return only ?? rest;
}

function shownOf(payload: JsonValue): JsonValue {
  return isJsonRecord(payload) && isJsonRecord(payload.json) ? payload.json : payload;
}
