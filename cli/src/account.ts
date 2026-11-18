import { z } from "zod";

export const usageDataSchema = z.object({
  costUsd: z.number(),
  requestCount: z.number(),
});

export const limitsSchema = z.object({
  data: z.object({ balanceUsd: z.number() }),
});

export type UsageData = z.infer<typeof usageDataSchema>;

const logEntrySchema = z.object({
  id: z.string(),
  apiKeyId: z.string().nullable(),
  apiKeyName: z.string().nullable(),
  endpoint: z.string(),
  method: z.string(),
  status: z.number(),
  costUsd: z.number(),
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

export function formatUsd(dollars: number): string {
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}
