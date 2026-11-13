import { toVnDateKey } from '@/lib/time';

export type CardMode = 'before' | 'dayof' | 'after';
export const CARD_MODES: readonly CardMode[] = ['before', 'dayof', 'after'];

/**
 * before: trước 0h ngày lễ (giờ VN)
 * dayof:  từ 0h ngày lễ đến hết ngày
 * after:  từ ngày hôm sau
 * `override` dùng cho ?mode= khi test.
 */
export function resolveMode(ceremonyAt: Date, now: Date = new Date(), override?: string | null): CardMode {
  if (override && (CARD_MODES as readonly string[]).includes(override)) return override as CardMode;
  const today = toVnDateKey(now);
  const day = toVnDateKey(ceremonyAt);
  if (today < day) return 'before';
  if (today === day) return 'dayof';
  return 'after';
}

export type Countdown =
  | { kind: 'days'; days: number }
  | { kind: 'hours'; hours: number; minutes: number }
  | { kind: 'minutes'; minutes: number }
  | { kind: 'started'; minutesAgo: number };

/** Dữ liệu thô cho đếm ngược; UI tự chọn cách hiển thị. */
export function countdown(ceremonyAt: Date, now: Date = new Date()): Countdown {
  const diffMin = Math.round((ceremonyAt.getTime() - now.getTime()) / 60_000);
  if (diffMin <= 0) return { kind: 'started', minutesAgo: -diffMin };
  if (diffMin < 60) return { kind: 'minutes', minutes: diffMin };
  if (diffMin < 24 * 60) return { kind: 'hours', hours: Math.floor(diffMin / 60), minutes: diffMin % 60 };
  return { kind: 'days', days: Math.ceil(diffMin / (24 * 60)) };
}
