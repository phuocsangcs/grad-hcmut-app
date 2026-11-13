import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** Lỗi nghiệp vụ có mã HTTP, service ném ra, route bắt và trả JSON. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
    public details?: unknown,
  ) {
    super(message ?? code);
  }
}

export const notFound = (code = 'not_found') => new HttpError(404, code);
export const badRequest = (code: string, details?: unknown) => new HttpError(400, code, undefined, details);
export const conflict = (code: string) => new HttpError(409, code);
export const tooMany = () => new HttpError(429, 'rate_limited');

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json(
      { ok: false, error: err.code, details: err.details ?? null },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { ok: false, error: 'invalid_input', details: err.flatten() },
      { status: 400 },
    );
  }
  console.error(err);
  return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
}

/** Bọc handler để mọi lỗi đều thành JSON thống nhất. */
export function handle<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (err) {
      return fail(err);
    }
  };
}

export async function readJson<T>(req: Request, parse: (raw: unknown) => T): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest('invalid_json');
  }
  return parse(raw);
}
