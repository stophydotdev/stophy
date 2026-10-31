import type { Caller } from "./transport";

export interface RequestOptions {
  signal?: AbortSignal;
}

export function post<Body, Response>(path: string, call: Caller) {
  return (body: Body, options?: RequestOptions): Promise<Response> =>
    call<Response>({ method: "POST", path, body, options });
}

export function postOptional<Body, Response>(path: string, call: Caller) {
  return (body?: Body, options?: RequestOptions): Promise<Response> =>
    call<Response>({
      method: "POST",
      path,
      body: body ?? {},
      options,
    });
}

export function get<Response>(path: string, call: Caller) {
  return (options?: RequestOptions): Promise<Response> =>
    call<Response>({ method: "GET", path, options });
}
