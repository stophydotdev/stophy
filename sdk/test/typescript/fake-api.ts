import { createServer } from "node:http";
import type { JsonValue } from "../../packages/typescript/src/json";

export interface Received {
  path: string;
  key: string | undefined;
  body: string;
}

type Answer =
  | { status: number; body: JsonValue; headers?: Record<string, string> }
  | "drop"
  | "hang";

export async function fakeApi(answer: (received: Received, count: number) => Answer) {
  const received: Received[] = [];
  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const key = req.headers["idempotency-key"];
      const item = {
        path: req.url ?? "",
        key: key?.toString(),
        body: Buffer.concat(chunks).toString(),
      };
      received.push(item);
      const reply = answer(item, received.length);
      if (reply === "hang") return;
      if (reply === "drop") return req.socket.destroy();
      res.writeHead(reply.status, { "content-type": "application/json", ...reply.headers });
      res.end(JSON.stringify(reply.body));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!(address instanceof Object)) throw new Error("The fake API has no port");
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    received,
    close: () => server.close(),
  };
}

export function acceptJobs(lost: Answer[] = ["drop"]) {
  const known = new Map<string, JsonValue>();
  const charges: string[] = [];
  const answer = ({ key }: Received, count: number): Answer => {
    const earlier = key === undefined ? undefined : known.get(key);
    const job = earlier ?? { success: true, id: `job_${charges.length + 1}` };
    if (earlier === undefined) {
      charges.push(`job_${charges.length + 1}`);
      if (key !== undefined) known.set(key, job);
    }
    return lost[count - 1] ?? { status: 200, body: job };
  };
  return { answer, charges };
}
