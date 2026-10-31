import { z } from "zod";
import { jsonObject } from "./catalog";

const requestBody = z.object({
  content: z.record(z.string(), z.object({ schema: jsonObject.optional(), example: jsonObject.optional() })),
});

const responseBody = z.object({
  content: z
    .record(
      z.string(),
      z.object({
        schema: z.object({ properties: z.object({ data: jsonObject.optional() }).optional() }).optional(),
      }),
    )
    .optional(),
});

const operation = z.object({
  summary: z.string().optional(),
  description: z.string().optional(),
  "x-credits": z.number().optional(),
  "x-credits-max": z.number().optional(),
  requestBody: requestBody.optional(),
  responses: z.record(z.string(), responseBody),
});

const spec = z.object({
  paths: z.record(z.string(), z.strictObject({ get: operation.optional(), post: operation.optional() })),
});

export type Spec = z.infer<typeof spec>;
export type SpecOperation = z.infer<typeof operation>;

export const readSpec = async (url: URL): Promise<Spec> => spec.parse(await Bun.file(url).json());

export const findOperation = (document: Spec, path: string, method: "GET" | "POST") => {
  const item = document.paths[path];
  return method === "GET" ? item?.get : item?.post;
};

export const requestJson = (op: SpecOperation) => op.requestBody?.content["application/json"];

export const responseData = (op: SpecOperation) =>
  op.responses["200"]?.content?.["application/json"]?.schema?.properties?.data;
