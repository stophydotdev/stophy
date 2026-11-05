export const pathDrift = (live: readonly string[], saved: readonly string[]) => ({
  extra: saved.filter((path) => !live.includes(path)),
  missing: live.filter((path) => !saved.includes(path)),
});
