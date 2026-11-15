import { z } from 'zod';

/**
 * Biến môi trường được kiểm tra một lần khi server khởi động.
 * Chỉ import file này từ code chạy phía server.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL thiếu'),
  DIRECT_URL: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
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

export type Env = z.infer<typeof schema>;

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
  cached = parsed.data;
  return cached;
}
