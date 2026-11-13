import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** Token quản lý: 32 byte random, dạng base64url (43 ký tự). Chỉ trả về đúng 1 lần khi tạo. */
export function generateManageToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function tokenLooksValid(token: string): boolean {
  return /^[A-Za-z0-9_-]{40,50}$/.test(token);
}

export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
