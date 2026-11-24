export async function withSpinner<T>(message: string, task: () => Promise<T>): Promise<T> {
  const { default: ora } = await import("ora");
  const spinner = ora({ text: message, stream: process.stderr }).start();
  try {
    const result = await task();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
}
