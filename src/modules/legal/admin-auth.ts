import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { getEnv } from '@/lib/env';

/**
 * Đăng nhập trang quản trị (/admin/inbox) bằng một mật khẩu duy nhất đặt trong biến ADMIN_TOKEN.
 * Cookie chỉ chứa HMAC của mật khẩu (không chứa mật khẩu), đổi ADMIN_TOKEN là mọi phiên cũ hết hiệu lực.
 */
export const ADMIN_COOKIE = 'nrt_admin';
export const ADMIN_SESSION_DAYS = 30;

function sha256(s: string): Buffer {
  return createHash('sha256').update(s).digest();
}

function safeEqual(a: string, b: string): boolean {
  // So sánh băm để hai chuỗi luôn cùng độ dài, tránh lộ thông tin qua thời gian chạy.
  return timingSafeEqual(sha256(a), sha256(b));
}

export function isAdminConfigured(): boolean {
  return !!getEnv().ADMIN_TOKEN;
}

export function checkAdminPassword(input: string): boolean {
  const token = getEnv().ADMIN_TOKEN;
  return !!token && safeEqual(input, token);
}

/** Giá trị cookie phiên hợp lệ. */
export function adminSessionValue(): string | null {
  const token = getEnv().ADMIN_TOKEN;
  return token ? createHmac('sha256', token).update('admin-session-v1').digest('hex') : null;
}

export function isAdminSession(cookieValue: string | undefined): boolean {
  const expected = adminSessionValue();
  return !!expected && !!cookieValue && safeEqual(cookieValue, expected);
}
