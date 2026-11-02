const KNOWN_AGENTS: readonly (readonly [name: string, signals: readonly string[]])[] = [
  ["claude-code", ["CLAUDECODE"]],
  ["codex", ["CODEX_SANDBOX", "CODEX_CI", "CODEX_THREAD_ID"]],
  ["cursor", ["CURSOR_AGENT"]],
  ["gemini-cli", ["GEMINI_CLI"]],
  ["opencode", ["OPENCODE_CLIENT", "OPENCODE"]],
];

const LABEL = /^[\w.-]{1,64}$/u;

const present = (name: string) => (process.env[name] ?? "") !== "";

const label = (name: string) => {
  const value = process.env[name];
  return value !== undefined && LABEL.test(value) ? value : undefined;
};

export function agentName(): string | undefined {
  return (
    label("STOPHY_AGENT") ??
    KNOWN_AGENTS.find(([, signals]) => signals.some(present))?.[0] ??
    label("AI_AGENT")
  );
}

export function isAgentMode(): boolean {
  return agentName() !== undefined || !process.stdout.isTTY;
}

let command: string | undefined;

export function setCommand(name: string): void {
  command = name;
}

export function currentCommand(): string | undefined {
  return command;
}
