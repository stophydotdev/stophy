export const clock = {
  sleep: (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
};
