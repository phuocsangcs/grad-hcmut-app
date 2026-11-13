'use client';

/** Client helper gọi API nội bộ, trả về data hoặc ném lỗi có mã. */
export class ApiError extends Error {
  constructor(public code: string, public status: number, public details?: unknown) {
    super(code);
  }
}

export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: T; error?: string; details?: unknown };
  if (!res.ok || !body.ok) throw new ApiError(body.error ?? 'server_error', res.status, body.details);
  return body.data as T;
}

/** Id ẩn danh của máy khách, dùng cho RSVP. */
export function getClientId(): string {
  const KEY = 'grad.clientId';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'nostorage-' + Math.random().toString(36).slice(2, 14);
  }
}
