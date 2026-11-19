const TZ = 'Asia/Ho_Chi_Minh';
const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const part = (opt: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, ...opt }).format(d);

export type DateParts = {
  /** "05" */
  day: string;
  /** "11" */
  month: string;
  /** "11" không đệm số 0 */
  monthNum: string;
  year: string;
  /** "08:00" */
  clock: string;
  /** "Thứ Năm" */
  weekdayLong: string;
  /** "T5" */
  weekdayShort: string;
  /** 0 = Chủ nhật */
  weekdayIndex: number;
};

/** Các mảnh ngày giờ theo giờ Việt Nam, dùng chung cho mọi mẫu. */
export function dateParts(iso: string | Date): DateParts {
  const at = typeof iso === 'string' ? new Date(iso) : iso;
  const weekdayIndex = new Date(at.toLocaleString('en-US', { timeZone: TZ })).getDay();
  return {
    day: part({ day: '2-digit' }, at),
    month: part({ month: '2-digit' }, at),
    monthNum: part({ month: 'numeric' }, at),
    year: part({ year: 'numeric' }, at),
    clock: part({ hour: '2-digit', minute: '2-digit', hour12: false }, at),
    weekdayLong: part({ weekday: 'long' }, at),
    weekdayShort: WEEKDAY_SHORT[weekdayIndex],
    weekdayIndex,
  };
}

/** Số ngày (làm tròn lên) từ `now` tới lễ; 0 nếu đã tới ngày. */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000));
}

/** "Nguyễn Minh Anh" → "Minh Anh" */
export const shortName = (name: string) => name.trim().split(/\s+/).slice(-2).join(' ');
/** "Nguyễn Minh Anh" → "Anh" */
export const firstName = (name: string) => name.trim().split(/\s+/).pop() ?? name;
/** "Nguyễn Minh Anh" → "MA" */
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const paragraphs = (message: string) =>
  message
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
