/**
 * Rate limit trong bộ nhớ theo khoá (thường là IP). Đủ cho POC một instance.
 * Khi scale nhiều instance thì thay bằng Upstash/KV với cùng interface.
 */
export type RateLimitRule = { limit: number; windowMs: number };

type Bucket = { count: number; resetAt: number };

export class MemoryRateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(private readonly maxKeys = 10_000) {}

  /** true nếu còn trong hạn mức. */
  hit(key: string, rule: RateLimitRule, now = Date.now()): { allowed: boolean; remaining: number; resetAt: number } {
    let b = this.buckets.get(key);
    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + rule.windowMs };
      this.buckets.set(key, b);
      if (this.buckets.size > this.maxKeys) this.sweep(now);
    }
    b.count += 1;
    return { allowed: b.count <= rule.limit, remaining: Math.max(0, rule.limit - b.count), resetAt: b.resetAt };
  }

  private sweep(now: number) {
    for (const [k, b] of this.buckets) if (b.resetAt <= now) this.buckets.delete(k);
  }

  clear() {
    this.buckets.clear();
  }
}

export const RULES = {
  createCard: { limit: 5, windowMs: 60 * 60_000 } satisfies RateLimitRule,
  rsvp: { limit: 20, windowMs: 10 * 60_000 } satisfies RateLimitRule,
  report: { limit: 5, windowMs: 60 * 60_000 } satisfies RateLimitRule,
  recover: { limit: 3, windowMs: 60 * 60_000 } satisfies RateLimitRule,
  bulkInvite: { limit: 30, windowMs: 60 * 60_000 } satisfies RateLimitRule,
};

const globalForRl = globalThis as unknown as { __rl?: MemoryRateLimiter };
export const limiter = (globalForRl.__rl ??= new MemoryRateLimiter());

/** Lấy IP từ header của Vercel/Cloudflare; không có thì dùng 'unknown'. */
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get('x-real-ip') ??
    h.get('cf-connecting-ip') ??
    h.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}
