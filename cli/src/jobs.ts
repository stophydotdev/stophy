import type { CatalogEndpoint } from "./catalog.js";
import type { RequestOptions } from "./client.js";
import { CliError } from "./errors.js";
import { type JsonRecord, readPrimitive, readString } from "./json.js";
import { withParserFormat } from "./parsers.js";

const id = { type: "string", description: "The id the job's start call returned" };
const byId = { type: "object", properties: { id }, required: ["id"] };
const paged = {
  type: "object",
  properties: {
    id,
    cursor: { type: "string", description: "The cursor in the next link of the previous answer" },
  },
  required: ["id"],
};

const agentById = {
  type: "object",
  properties: { id: { ...id, pattern: "^[A-Za-z0-9_-]{1,100}$" } },
  required: ["id"],
};

const AGENT_JOB_ENDPOINTS: readonly CatalogEndpoint[] = [
  {
    id: "agent.list",
    summary: "List recent agent runs",
    method: "GET",
    path: "/v1/agent",
    keyless: false,
    costUsd: 0,
    input: {
      type: "object",
      properties: {
        before: {
          type: "integer",
          minimum: 1,
          description: "List runs created before this Unix timestamp in milliseconds",
        },
        limit: { type: "integer", minimum: 1, maximum: 20, description: "Runs per page" },
      },
    },
  },
  {
    id: "agent.status",
    summary: "Check an agent run and read its answer",
    method: "GET",
    path: "/v1/agent/{id}",
    keyless: false,
    costUsd: 0,
    input: agentById,
  },
  {
    id: "agent.cancel",
    summary: "Stop an agent run",
    method: "DELETE",
    path: "/v1/agent/{id}",
    keyless: false,
    costUsd: 0,
    input: agentById,
  },
];

const JOB_ENDPOINTS: readonly CatalogEndpoint[] = [
  ...AGENT_JOB_ENDPOINTS,
  {
    id: "crawl.status",
    summary: "Check a crawl and read its pages",
    method: "GET",
    path: "/v1/crawl/{id}",
    keyless: false,
    input: paged,
  },
  {
    id: "crawl.cancel",
    summary: "Stop a crawl",
    method: "DELETE",
    path: "/v1/crawl/{id}",
    keyless: false,
    input: byId,
  },
  {
    id: "batch.scrape.status",
    summary: "Check a batch scrape and read its pages",
    method: "GET",
    path: "/v1/batch/scrape/{id}",
    keyless: false,
    input: paged,
  },
  {
    id: "batch.scrape.cancel",
    summary: "Stop a batch scrape",
    method: "DELETE",
    path: "/v1/batch/scrape/{id}",
    keyless: false,
    input: byId,
  },
  {
    id: "extract.status",
    summary: "Check an extract and read its result",
    method: "GET",
    path: "/v1/extract/{id}",
    keyless: false,
    input: byId,
  },
];

export function withJobEndpoints(endpoints: readonly CatalogEndpoint[]): CatalogEndpoint[] {
  const listed = new Set(endpoints.map((endpoint) => endpoint.id));
  const owned = JOB_ENDPOINTS.filter(
    (job) => !listed.has(job.id) && listed.has(job.id.slice(0, job.id.lastIndexOf("."))),
  );
  return [...endpoints, ...owned];
}

export function isAgentCommand(id: string): boolean {
  return id === "agent" || AGENT_JOB_ENDPOINTS.some((job) => job.id === id);
}

export function reserveAgentPrompt(
  endpoint: CatalogEndpoint,
  tokens: readonly string[],
  body: JsonRecord,
): void {
  if (endpoint.id !== "agent") return;
  const prompt = readString(body.prompt);
  const control = AGENT_JOB_ENDPOINTS.find((job) => job.id === `agent.${prompt}`);
  if (!control || tokens.some((token) => token === "--prompt" || token.startsWith("--prompt="))) {
    return;
  }
  const idArg = control.path.includes("{id}") ? " <id>" : "";
  throw new CliError(
    `Use \`stophy agent ${prompt}${idArg}\` to manage runs, or \`stophy agent --prompt ${prompt}\` to start one.`,
  );
}

export function requestFor(
  endpoint: CatalogEndpoint,
  body: JsonRecord,
): Pick<RequestOptions, "method" | "path" | "body" | "params"> {
  if (endpoint.method === "POST") {
    return { method: "POST", path: endpoint.path, body: withParserFormat(body) };
  }
  const { id: jobId, ...query } = body;
  const readParam = endpoint.id === "agent.list" ? readPrimitive : readString;
  return {
    method: endpoint.method,
    path: endpoint.path.replace("{id}", encodeURIComponent(readString(jobId) ?? "")),
    params: Object.fromEntries(
      Object.entries(query).map(([key, value]) => {
        const param = readParam(value);
        return [key, param === undefined ? undefined : String(param)];
      }),
    ),
  };
}
