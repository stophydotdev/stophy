import packageJson from "../package.json" with { type: "json" };
import { compareVersions } from "./npm-registry.js";

export const MIN_VERSION_HEADER = "x-stophy-min-cli-version";

export const UPGRADE_COMMAND = "npm install -g @stophy/cli@latest";

const UPGRADE_ADVICE = `Upgrade with \`${UPGRADE_COMMAND}\`, or run the installer again: curl -fsSL https://stophy.dev/install | bash`;

const current = packageJson.version;

const VERSION = /^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/u;

export const isBelowMinimum = (minimum: string | null): minimum is string =>
  minimum !== null && VERSION.test(minimum) && compareVersions(current, minimum) < 0;

export const minimumNote = (minimum: string) =>
  `This CLI (v${current}) is older than the minimum (v${minimum}) the API supports. ${UPGRADE_ADVICE}`;

export const unreadableAdvice = (minimum: string | null) =>
  isBelowMinimum(minimum)
    ? minimumNote(minimum)
    : `This CLI (v${current}) may be out of date. ${UPGRADE_ADVICE}`;
