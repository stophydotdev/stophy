import { isAgentMode } from "./agent.js";
import { currentArgs, flagTokens } from "./argv.js";
import type { CatalogEndpoint } from "./catalog.js";
import { request } from "./client.js";
import { CliError } from "./errors.js";
import { parseCall } from "./flags.js";
import { handleOutput, writeOutput } from "./output.js";
import { renderData } from "./render.js";
import { withSignup } from "./signup.js";
import { withSpinner } from "./spinner.js";
import { successEnvelope } from "./types/api.js";

export async function runEndpoint(endpoint: CatalogEndpoint): Promise<void> {
  const parsed = parseCall(flagTokens(currentArgs(), endpoint.id.split(".")), endpoint.input);
  if (!parsed.ok) throw new CliError(parsed.message);

  const send = () =>
    request({
      method: "POST",
      path: endpoint.path,
      body: parsed.call.body,
      accept: "application/json",
    });
  const response = await withSignup(() =>
    isAgentMode() ? send() : withSpinner(`Calling ${endpoint.id.split(".").join(" ")}…`, send),
  );

  const envelope = successEnvelope.safeParse(response.json);
  if (!envelope.success) throw new CliError("Server returned an unexpected response shape.");
  const format =
    parsed.call.format === "text" && isAgentMode() && parsed.call.outputFile === undefined
      ? "raw"
      : parsed.call.format;
  if (format === "json") {
    process.stderr.write(`credits used: ${envelope.data.creditsUsed}\n`);
  }
  if (format === "text") {
    writeOutput(renderData(envelope.data.data), parsed.call.outputFile);
    return;
  }
  if (format === "raw") {
    handleOutput(envelope.data, { output: parsed.call.outputFile });
    return;
  }
  handleOutput(envelope.data.data, { output: parsed.call.outputFile });
}
