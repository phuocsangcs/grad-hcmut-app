import { getEnv } from '@/lib/env';

/**
 * Xác minh token Cloudflare Turnstile ở server.
 * Không cấu hình TURNSTILE_SECRET_KEY (dev) → bỏ qua, luôn hợp lệ.
 */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = getEnv().TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') body.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
