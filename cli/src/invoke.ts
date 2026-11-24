import { formatUsd } from "./account.js";
import { isAgentMode } from "./agent.js";
import { currentArgs, flagTokens } from "./argv.js";
import type { CatalogEndpoint } from "./catalog.js";
import { type HttpResponse, request, unexpectedResponse } from "./client.js";
import { CliError } from "./errors.js";
import { type ParsedCall, parseCall } from "./flags.js";
import { isAgentCommand, requestFor, reserveAgentPrompt } from "./jobs.js";
import { type JsonRecord, type JsonValue, isJsonRecord, jsonRecord } from "./json.js";
import { handleOutput, writeOutput } from "./output.js";
import { renderData } from "./render.js";
import { withSignup } from "./signup.js";
import { withSpinner } from "./spinner.js";

type TextView = (body: JsonRecord) => JsonRecord;

export function endpointTokens(endpoint: CatalogEndpoint): readonly string[] {
  const args = currentArgs();
  const words = endpoint.id.split(".");
  const agentControl = endpoint.id !== "agent" && isAgentCommand(endpoint.id);
  if (agentControl && !words.every((word, index) => args[index] === word)) {
    throw new CliError(
      `Use \`stophy ${words.join(" ")}\` without a separator before the subcommand.`,
    );
  }
  return agentControl ? args.slice(words.length) : flagTokens(args, words);
}

export function parseEndpointCall(
  endpoint: CatalogEndpoint,
  tokens = endpointTokens(endpoint),
): ParsedCall {
  const parsed = parseCall(tokens, endpoint.input);
  if (!parsed.ok) throw new CliError(parsed.message);
  reserveAgentPrompt(endpoint, tokens, parsed.call.body);
  return parsed.call;
}

export async function runEndpoint(
  endpoint: CatalogEndpoint,
  call = parseEndpointCall(endpoint),
  view: TextView = (body) => body,
): Promise<void> {
  const send = () => request({ ...requestFor(endpoint, call.body), accept: "application/json" });
  const response = await withSignup(() =>
    isAgentMode() ? send() : withSpinner(`Calling ${endpoint.id.split(".").join(" ")}…`, send),
  );
  writeAnswer(endpoint, call, response, view);
}

export function writeAnswer(
  endpoint: CatalogEndpoint,
  call: ParsedCall,
  response: HttpResponse,
  view: TextView,
): void {
  const parsed = jsonRecord.safeParse(response.json);
  if (!parsed.success) throw unexpectedResponse(response);
  const body = withReceiptId(parsed.data, response);
  const { format } = call;
  if (format === "text" && isAgentMode() && call.outputFile === undefined) {
    handleOutput(agentLineOf(view(body)));
    return;
  }
  if (format === "text") {
    const shown = shownOf(payloadOf(view(parsed.data)));
    const text = renderData(shown);
    const emptyAgentList =
      endpoint.id === "agent.list" &&
      isJsonRecord(shown) &&
      Array.isArray(shown.agents) &&
      shown.agents.length === 0;
    writeOutput(text || (emptyAgentList ? "No agent runs found." : ""), call.outputFile);
    writeReceipt(response, { cost: false, requestId: call.outputFile !== undefined });
    return;
  }
  handleOutput(format === "raw" ? body : payloadOf(parsed.data), { output: call.outputFile });
  writeReceipt(response, { cost: format === "json", requestId: format === "json" });
}

function withReceiptId(body: JsonRecord, { requestId }: HttpResponse): JsonRecord {
  return requestId === null || body.requestId !== undefined ? body : { ...body, requestId };
}

function writeReceipt(
  response: HttpResponse,
  show: { readonly cost: boolean; readonly requestId: boolean },
) {
  if (show.cost && response.costUsd !== null) {
    process.stderr.write(`cost: ${formatUsd(Number(response.costUsd))}\n`);
  }
  if (show.requestId && response.requestId !== null) {
    process.stderr.write(`request id: ${response.requestId}\n`);
  }
}

export function without(body: JsonRecord, dropped: readonly string[]): JsonRecord {
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
