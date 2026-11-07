import type { CatalogEndpoint } from "./catalog.js";
import type { RequestOptions } from "./client.js";
import { type JsonRecord, readString } from "./json.js";
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

const JOB_ENDPOINTS: readonly CatalogEndpoint[] = [
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

export function requestFor(
  endpoint: CatalogEndpoint,
  body: JsonRecord,
): Pick<RequestOptions, "method" | "path" | "body" | "params"> {
  if (endpoint.method === "POST") {
    return { method: "POST", path: endpoint.path, body: withParserFormat(body) };
  }
  const { id: jobId, ...query } = body;
  return {
    method: endpoint.method,
    path: endpoint.path.replace("{id}", encodeURIComponent(readString(jobId) ?? "")),
    params: Object.fromEntries(
      Object.entries(query).map(([key, value]) => [key, readString(value)]),
    ),
  };
}
