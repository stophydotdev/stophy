import { z } from "zod";
import { jsonValue } from "../json.js";

export const successEnvelope = z.object({
  success: z.literal(true),
  data: jsonValue.optional(),
  creditsUsed: z.number().int().nonnegative(),
  requestId: z.string(),
});

export type SuccessEnvelope = z.infer<typeof successEnvelope>;

export interface OutputOptions {
  json?: boolean;
  output?: string;
}
