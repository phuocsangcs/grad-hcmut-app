/**
 * Mọi tính toán ngày giờ của app đều theo giờ Việt Nam.
 * Không phụ thuộc timezone của server (Vercel chạy UTC).
 */
export const TZ = 'Asia/Ho_Chi_Minh';
export const TZ_OFFSET_MINUTES = 7 * 60;

const dateFmt = new Intl.DateTimeFormat('vi-VN', {
  timeZone: TZ,
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const timeFmt = new Intl.DateTimeFormat('vi-VN', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** "Thứ Bảy, 28/11/2026" */
export function formatDateVi(d: Date): string {
  const s = dateFmt.format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "14h30" */
export function formatTimeVi(d: Date): string {
  const [h, m] = timeFmt.format(d).split(':');
  return `${h}h${m}`;
}

/** "YYYY-MM-DD" theo giờ VN, dùng để so sánh "cùng ngày". */
export function toVnDateKey(d: Date): string {
  const shifted = new Date(d.getTime() + TZ_OFFSET_MINUTES * 60_000);
  return shifted.toISOString().slice(0, 10);
}

/** Tạo Date từ giờ địa phương VN, ví dụ vnDate('2026-11-28', '14:30'). */
export function vnDate(dateKey: string, time = '00:00'): Date {
  return new Date(`${dateKey}T${time}:00+07:00`);
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86_400_000);
}

export function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60_000);
}

/** Dạng "20261128T143000" dùng cho Google Calendar / ICS (giờ địa phương VN). */
export function toCompactLocal(d: Date): string {
  const shifted = new Date(d.getTime() + TZ_OFFSET_MINUTES * 60_000);
  return shifted.toISOString().replace(/[-:]/g, '').slice(0, 15);
}
