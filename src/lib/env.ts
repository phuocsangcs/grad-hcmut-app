import { z } from 'zod';

/**
 * Biến môi trường được kiểm tra một lần khi server khởi động.
 * Chỉ import file này từ code chạy phía server.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL thiếu'),
  DIRECT_URL: z.string().optional(),
  /** URL gốc để ghép link thiệp, QR, email. Không đặt thì đoán từ Vercel (xem siteUrlFallback). */
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  // Biến hệ thống Vercel tự cấp (không cần khai báo): môi trường và tên miền của bản deploy.
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  // Cloudflare R2 (ảnh thiệp). Thiếu một biến thì tính năng ảnh tự tắt.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  /** URL công khai của bucket (r2.dev hoặc tên miền riêng), không có dấu / ở cuối. */
  R2_PUBLIC_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof schema> & { NEXT_PUBLIC_SITE_URL: string };

/**
 * Khi chưa đặt NEXT_PUBLIC_SITE_URL:
 * - Vercel production → tên miền production của dự án (vd. ngay-ra-truong.vercel.app hoặc tên miền riêng đã gắn)
 * - Vercel preview → URL của bản preview đó
 * - còn lại (máy dev) → http://localhost:3000
 */
export function resolveSiteUrl(e: Pick<z.infer<typeof schema>, 'NEXT_PUBLIC_SITE_URL' | 'VERCEL_ENV' | 'VERCEL_URL' | 'VERCEL_PROJECT_PRODUCTION_URL'>): string {
  if (e.NEXT_PUBLIC_SITE_URL) return e.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  const host = e.VERCEL_ENV === 'production' ? e.VERCEL_PROJECT_PRODUCTION_URL ?? e.VERCEL_URL : e.VERCEL_URL;
  return host ? `https://${host}` : 'http://localhost:3000';
}

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  // Biến khai báo rỗng (KEY="") coi như không có, để .optional() / .default() hoạt động.
  const raw = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined && v.trim() !== ''));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Cấu hình môi trường không hợp lệ:\n${issues}`);
  }
  cached = { ...parsed.data, NEXT_PUBLIC_SITE_URL: resolveSiteUrl(parsed.data) };
  return cached;
}
