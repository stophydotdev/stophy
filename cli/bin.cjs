#!/usr/bin/env node
const { spawn } = require("node:child_process");
const { constants } = require("node:os");

function run(args) {
  const { platform, arch } = process;
  const packageName = `@stophy/native-${platform}-${arch}`;
  let binary;
  try {
    binary = require.resolve(packageName);
  } catch {
    process.stderr.write(
      `Stophy is unavailable for ${platform}-${arch}. On a supported platform, install @stophy/cli with optional dependencies enabled.\n`,
    );
    process.exitCode = 1;
    return;
  }

  const child = spawn(binary, args, { stdio: "inherit" });
  const handlers = new Map();
  for (const signal of ["SIGINT", "SIGTERM"]) {
    const forward = () => child.kill(signal);
    handlers.set(signal, forward);
    process.on(signal, forward);
  }
  child.once("error", (error) => {
    process.stderr.write(`Could not start Stophy: ${error.message}\n`);
    process.exitCode = 1;
  });
  child.once("close", (code, signal) => {
    for (const [name, handler] of handlers) process.off(name, handler);
    process.exitCode = code ?? (signal ? 128 + (constants.signals[signal] ?? 0) : 1);
  });
}

module.exports = run;
if (require.main === module) run(process.argv.slice(2));
