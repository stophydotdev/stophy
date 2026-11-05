import type { Caller, Method, Query } from "./transport";

export interface RequestOptions {
  signal?: AbortSignal;
}

export function post<Body, Response>(path: string, call: Caller) {
  return (body: Body, options?: RequestOptions): Promise<Response> =>
    call<Response>({ method: "POST", path, body, options });
}

export function postOptional<Body, Response>(path: string, call: Caller) {
  return (body?: Body, options?: RequestOptions): Promise<Response> =>
    call<Response>({ method: "POST", path, body: body ?? {}, options });
}

export function send<Input extends Query, Response>(method: Method, path: string, call: Caller) {
  return (input: Input, options?: RequestOptions): Promise<Response> =>
    call<Response>({ method, ...fillPath(path, input), options });
}

export function sendOptional<Input extends Query, Response>(
  method: Method,
  path: string,
  call: Caller,
) {
  return (input?: Input, options?: RequestOptions): Promise<Response> =>
    call<Response>({ method, ...fillPath(path, input ?? {}), options });
}

export function sendEmpty<Response>(method: Method, path: string, call: Caller) {
  return (options?: RequestOptions): Promise<Response> => call<Response>({ method, path, options });
}

function fillPath(template: string, input: Query) {
  const used = new Set<string>();
  const path = template.replaceAll(/\{(\w+)\}/g, (_, name: string) => {
    const value = input[name];
    if (value === undefined) throw new TypeError(`Missing ${name} for ${template}`);
    used.add(name);
    return encodeURIComponent(String(value));
  });
  const query = Object.fromEntries(Object.entries(input).filter(([key]) => !used.has(key)));
  return { path, query };
}
