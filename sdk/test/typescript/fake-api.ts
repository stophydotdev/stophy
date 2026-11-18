import { createServer } from "node:http";
import type { JsonValue } from "../../packages/typescript/src/json";

export interface Received {
  path: string;
  key: string | undefined;
  body: string;
}

type Answer = { status: number; body: JsonValue; headers?: Record<string, string> } | "drop";

export async function fakeApi(answer: (received: Received, count: number) => Answer) {
  const received: Received[] = [];
  const answered = Promise.withResolvers<void>();
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
      if (reply === "drop") return req.socket.destroy();
      res.writeHead(reply.status, { "content-type": "application/json", ...reply.headers });
      res.end(JSON.stringify(reply.body), () => answered.resolve());
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!(address instanceof Object)) throw new Error("The fake API has no port");
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    received,
    answered: answered.promise,
    close: () => server.close(),
  };
}
