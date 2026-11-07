import { accessSync, chmodSync, constants, existsSync } from "node:fs";
import { dirname } from "node:path";
import Conf from "conf";
import { z } from "zod";
import { CliError } from "./errors.js";

const pendingSignup = z.object({ code: z.string(), claimUrl: z.string(), expiresAt: z.string() });

export type PendingSignup = z.infer<typeof pendingSignup>;

export interface CliConfig {
  pendingSignups?: PendingSignup[] | undefined;
  apiKey?: string;
  baseUrl?: string;
  frontendUrl?: string;
  sessionCookie?: string;
  sessionExpiresAt?: string;
}

export const DEFAULT_BASE_URL = "https://api.stophy.dev";
export const DEFAULT_FRONTEND_URL = "https://stophy.dev";

const store = new Conf<CliConfig>({
  projectName: "stophy",
  projectSuffix: "",
  configName: "config",
});

export function getConfigPath() {
  return store.path;
}

export function assertConfigWritable() {
  const target = existsSync(store.path) ? store.path : dirname(store.path);
  try {
    accessSync(existsSync(target) ? target : dirname(target), constants.W_OK);
  } catch {
    throw new CliError(
      `Can't save a key to ${store.path}. Set STOPHY_API_KEY instead, or make that file writable.`,
    );
  }
}

function secureConfigFile() {
  try {
    chmodSync(store.path, 0o600);
  } catch {}
}

export async function loadConfig(): Promise<CliConfig> {
  try {
    const listed = z.array(pendingSignup).safeParse(store.get("pendingSignups")).data ?? [];
    const legacy = pendingSignup.safeParse(store.get("pendingSignup")).data;
    const pendingSignups = legacy === undefined ? listed : [...listed, legacy];
    return {
      apiKey: normalizeApiKey(store.get("apiKey")),
      baseUrl: normalizeBaseUrl(store.get("baseUrl")),
      frontendUrl: normalizeBaseUrl(store.get("frontendUrl")),
      sessionCookie: normalizeSessionCookie(store.get("sessionCookie")),
      sessionExpiresAt: normalizeSessionExpiry(store.get("sessionExpiresAt")),
      pendingSignups: pendingSignups.length > 0 ? pendingSignups : undefined,
    };
  } catch {
    throw new CliError(`Failed to read config at ${store.path}.`);
  }
}

export async function saveConfig(config: CliConfig) {
  store.store = {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    frontendUrl: config.frontendUrl,
    sessionCookie: config.sessionCookie,
    sessionExpiresAt: config.sessionExpiresAt,
    pendingSignups: config.pendingSignups?.length ? config.pendingSignups : undefined,
  };
  secureConfigFile();
}

export async function setStoredApiKey(apiKey: string) {
  const config = await loadConfig();
  config.apiKey = normalizeApiKey(apiKey);
  config.pendingSignups = undefined;
  await saveConfig(config);
  return config;
}

export async function clearStoredAuth() {
  const config = await loadConfig();
  const nextConfig: CliConfig = {
    baseUrl: config.baseUrl,
    frontendUrl: config.frontendUrl,
  };
  await saveConfig(nextConfig);
  return nextConfig;
}

export async function resolveRuntimeConfig() {
  const config = await loadConfig();
  const envApiKey = normalizeApiKey(process.env.STOPHY_API_KEY);
  const apiKey = envApiKey ?? normalizeApiKey(config.apiKey);
  const apiKeySource: "env" | "stored" | undefined = envApiKey
    ? "env"
    : config.apiKey
      ? "stored"
      : undefined;
  const baseUrl =
    normalizeBaseUrl(process.env.STOPHY_BASE_URL ?? config.baseUrl) ?? DEFAULT_BASE_URL;
  const frontendUrl =
    normalizeBaseUrl(process.env.STOPHY_FRONTEND_URL ?? config.frontendUrl) ?? DEFAULT_FRONTEND_URL;
  return {
    apiKey,
    apiKeySource,
    baseUrl,
    frontendUrl,
    sessionCookie: normalizeSessionCookie(config.sessionCookie),
    sessionExpiresAt: normalizeSessionExpiry(config.sessionExpiresAt),
  };
}

export function normalizeApiKey(apiKey?: string | null) {
  const value = apiKey?.trim();
  return value ? value : undefined;
}

export function normalizeBaseUrl(baseUrl?: string | null) {
  const value = baseUrl?.trim();
  if (!value) {
    return;
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function normalizeSessionCookie(sessionCookie?: string | null) {
  const value = sessionCookie?.trim();
  return value ? value : undefined;
}

export function normalizeSessionExpiry(sessionExpiresAt?: string | null) {
  const value = sessionExpiresAt?.trim();
  return value ? value : undefined;
}

export function validateApiKey(apiKey: string) {
  if (!apiKey.startsWith("st_")) {
    throw new CliError("API key must start with `st_`.");
  }
  if (apiKey.length < 10) {
    throw new CliError("API key is too short.");
  }
  return apiKey;
}

export function getBrowserLoginUrl(frontendUrl: string, sessionId: string, codeChallenge: string) {
  const url = new URL("/cli-auth", frontendUrl);
  url.searchParams.set("session_id", sessionId);
  url.searchParams.set("code_challenge", codeChallenge);
  return url.toString();
}
