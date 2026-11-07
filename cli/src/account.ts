import { z } from "zod";

export const usageDataSchema = z.object({
  creditsUsed: z.number(),
  requestCount: z.number(),
});

export const limitsSchema = z.object({
  data: z.object({ balanceCredits: z.number() }),
});

export type UsageData = z.infer<typeof usageDataSchema>;

const logEntrySchema = z.object({
  id: z.string(),
  apiKeyId: z.string().nullable(),
  apiKeyName: z.string().nullable(),
  endpoint: z.string(),
  method: z.string(),
  status: z.number(),
  credits: z.number(),
  durationMs: z.number().nullable(),
  response: z.string().nullable(),
  createdAt: z.string(),
});

export const logsDataSchema = z.object({
  logs: z.array(logEntrySchema),
  endpoints: z.array(z.string()),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export type LogsData = z.infer<typeof logsDataSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;

export function formatBalance(credits: number): string {
  return `${Math.floor(credits).toLocaleString("en-US")} credits`;
}
