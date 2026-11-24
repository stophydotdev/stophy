import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { expect, test } from "bun:test";
import { deviceName, loginCode } from "../src/login-code.ts";

const home = `/tmp/stophy-cli-login-${process.pid}`;
mkdirSync(home, { recursive: true });
process.env.XDG_CONFIG_HOME = home;

test("the login code matches the server for the shared test vector", () => {
  expect(loginCode("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM")).toBe("1MMS-P7NN");
  expect(loginCode("another-challenge")).toMatch(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/u);
});

test("the device name keeps only what the server accepts", () => {
  expect(deviceName("haki-laptop")).toBe("haki-laptop");
  expect(deviceName(" my\nmac<>book!!  pro ")).toBe("my macbook pro");
  expect(deviceName("x".repeat(80))).toBe("x".repeat(64));
  expect(deviceName("@@@")).toBeUndefined();
});

test("the config file earlier versions wrote is read, and saving keeps it private", async () => {
  const { getConfigPath, loadConfig, setStoredApiKey } = await import("../src/config.ts");
  const key = `st_${"b".repeat(40)}`;
  const file = getConfigPath();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(
    file,
    JSON.stringify({ apiKey: key, baseUrl: "https://api.example.com/" }, undefined, "\t"),
  );
  expect(await loadConfig()).toMatchObject({ apiKey: key, baseUrl: "https://api.example.com" });

  await setStoredApiKey(key);
  expect(readFileSync(file, "utf8")).toBe(
    JSON.stringify({ apiKey: key, baseUrl: "https://api.example.com" }, undefined, "\t"),
  );
  expect(statSync(file).mode & 0o777).toBe(0o600);
});

test("logout forgets the saved key even when the server cannot revoke it", async () => {
  const { setStoredApiKey, loadConfig } = await import("../src/config.ts");
  const { logout } = await import("../src/commands/account.ts");
  const { CliError } = await import("../src/errors.ts");
  const key = `st_${"a".repeat(40)}`;

  await setStoredApiKey(key);
  const revoked: string[] = [];
  expect(await logout(async (apiKey) => void revoked.push(apiKey))).toContain("Logged out.");
  expect(revoked).toEqual([key]);
  expect((await loadConfig()).apiKey).toBeUndefined();

  await setStoredApiKey(key);
  const failed = await logout(async () => {
    throw new CliError("Not Found", 1, { status: 404 });
  });
  expect(failed).toContain("was not revoked");
  expect((await loadConfig()).apiKey).toBeUndefined();

  await setStoredApiKey(key);
  await logout(async () => {
    throw new CliError("Network request failed");
  });
  expect((await loadConfig()).apiKey).toBeUndefined();
});

test("a stale temp file cannot make the saved key readable, and a failed save leaves no copy of the key", async () => {
  const { getConfigPath, saveConfig, setStoredApiKey } = await import("../src/config.ts");
  const key = `st_${"c".repeat(40)}`;
  const file = getConfigPath();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(`${file}.${process.pid}.tmp`, "{}", { mode: 0o644 });
  await setStoredApiKey(key);
  expect(statSync(file).mode & 0o777).toBe(0o600);

  rmSync(file);
  mkdirSync(`${file}/in-the-way`, { recursive: true });
  try {
    await expect(saveConfig({ apiKey: key })).rejects.toThrow();
    expect(readdirSync(dirname(file)).filter((name) => name.endsWith(".tmp"))).toEqual([]);
  } finally {
    rmSync(file, { recursive: true, force: true });
  }
});
