import { formatUsd } from "./account.js";
import { isAgentMode } from "./agent.js";
import { currentArgs, flagTokens } from "./argv.js";
import type { CatalogEndpoint } from "./catalog.js";
import { request } from "./client.js";
import { CliError } from "./errors.js";
import { type ParsedCall, parseCall } from "./flags.js";
import { isAgentCommand, requestFor, reserveAgentPrompt } from "./jobs.js";
import { type JsonRecord, type JsonValue, isJsonRecord, jsonRecord } from "./json.js";
import { handleOutput, writeOutput } from "./output.js";
import { renderData } from "./render.js";
import { withSignup } from "./signup.js";
import { withSpinner } from "./spinner.js";

export function parseEndpointCall(endpoint: CatalogEndpoint): ParsedCall {
  const args = currentArgs();
  const words = endpoint.id.split(".");
  const agentControl = endpoint.id !== "agent" && isAgentCommand(endpoint.id);
  if (agentControl && !words.every((word, index) => args[index] === word)) {
    throw new CliError(
      `Use \`stophy ${words.join(" ")}\` without a separator before the subcommand.`,
    );
  }
  const tokens = agentControl ? args.slice(words.length) : flagTokens(args, words);
  const parsed = parseCall(tokens, endpoint.input);
  if (!parsed.ok) throw new CliError(parsed.message);
  reserveAgentPrompt(endpoint, tokens, parsed.call.body);
  return parsed.call;
}

export async function runEndpoint(endpoint: CatalogEndpoint): Promise<void> {
  const call = parseEndpointCall(endpoint);
  const send = () => request({ ...requestFor(endpoint, call.body), accept: "application/json" });
  const response = await withSignup(() =>
    isAgentMode() ? send() : withSpinner(`Calling ${endpoint.id.split(".").join(" ")}…`, send),
  );

  const body = jsonRecord.safeParse(response.json);
  if (!body.success) throw new CliError("Server returned an unexpected response shape.");
  const { format } = call;
  if (format === "text" && isAgentMode() && call.outputFile === undefined) {
    handleOutput(agentLineOf(body.data));
    return;
  }
  if (format === "json" && response.costUsd !== null) {
    process.stderr.write(`cost: ${formatUsd(Number(response.costUsd))}\n`);
  }
  if (format === "text") {
    const shown = shownOf(payloadOf(body.data));
    const text = renderData(shown);
    const emptyAgentList =
      endpoint.id === "agent.list" &&
      isJsonRecord(shown) &&
      Array.isArray(shown.agents) &&
      shown.agents.length === 0;
    writeOutput(text || (emptyAgentList ? "No agent runs found." : ""), call.outputFile);
    return;
  }
  handleOutput(format === "raw" ? body.data : payloadOf(body.data), {
    output: call.outputFile,
  });
}

function without(body: JsonRecord, dropped: readonly string[]): JsonRecord {
  return Object.fromEntries(Object.entries(body).filter(([key]) => !dropped.includes(key)));
}

export function agentLineOf(body: JsonRecord): JsonRecord {
  return without(body, ["creditsUsed"]);
}

export function payloadOf(body: JsonRecord): JsonValue {
  const rest = without(body, ["success", "creditsUsed"]);
  return rest.data ?? rest;
}

function shownOf(payload: JsonValue): JsonValue {
  return isJsonRecord(payload) && isJsonRecord(payload.json) ? payload.json : payload;
}
