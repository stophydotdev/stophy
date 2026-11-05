import type { CatalogEndpoint } from "./catalog.js";
import { CliError } from "./errors.js";
import { type JsonRecord, isJsonRecord, readString } from "./json.js";

const PARSER_FLAGS: JsonRecord = {
  parser: {
    type: "string",
    description: "A parser from stophy parsers, which returns the site's own data as json",
  },
  parserOptions: { type: "object" },
};

export function withParserFlags(endpoints: readonly CatalogEndpoint[]): CatalogEndpoint[] {
  return endpoints.map((endpoint) => {
    const properties = endpoint.input.properties;
    if (endpoint.id !== "scrape" || !isJsonRecord(properties)) return endpoint;
    return {
      ...endpoint,
      input: { ...endpoint.input, properties: { ...properties, ...PARSER_FLAGS } },
    };
  });
}

export function withParserFormat(body: JsonRecord): JsonRecord {
  const { parser, parserOptions, ...rest } = body;
  if (parser === undefined && parserOptions === undefined) return body;
  const name = readString(parser);
  if (name === undefined) throw new CliError("--parserOptions needs --parser.");
  const formats = Array.isArray(rest.formats) ? rest.formats : [];
  const format: JsonRecord = { type: "json", parser: name };
  if (parserOptions !== undefined) format.options = parserOptions;
  return { ...rest, formats: [...formats, format] };
}
