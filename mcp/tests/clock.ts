const setTimer = globalThis.setTimeout;
const clearTimer = globalThis.clearTimeout;
const timers = new Map<Parameters<typeof clearTimer>[0], { at: number; run: () => void }>();
let now = 0;

const schedule = (run: () => void, delay: number) => {
  const timer = setTimer(run, 2_147_483_647);
  timers.set(timer, { at: now + delay, run });
  return timer;
};
globalThis.setTimeout = Object.assign(schedule, { __promisify__: setTimer.__promisify__ });
globalThis.clearTimeout = (timer) => {
  timers.delete(timer);
  clearTimer(timer);
};
process.on("message", (elapsed: number) => {
  now += elapsed;
  for (const [timer, { at, run }] of timers) {
    if (at > now) continue;
    clearTimeout(timer);
    run();
  }
  process.send?.(now);
});

await import(process.argv[2] ?? "../src/index.ts");
