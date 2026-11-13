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
  ADMIN_EMAIL: z.string().email().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Cấu hình môi trường không hợp lệ:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
