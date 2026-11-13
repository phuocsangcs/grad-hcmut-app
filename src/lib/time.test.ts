import { describe, expect, it } from 'vitest';
import { formatDateVi, formatTimeVi, toCompactLocal, toVnDateKey, vnDate } from './time';

describe('time (Asia/Ho_Chi_Minh)', () => {
  const d = vnDate('2026-11-28', '14:30');

  it('vnDate tạo đúng mốc UTC', () => {
    expect(d.toISOString()).toBe('2026-11-28T07:30:00.000Z');
  });
  it('format ngày giờ tiếng Việt', () => {
    expect(formatDateVi(d)).toBe('Thứ Bảy, 28/11/2026');
    expect(formatTimeVi(d)).toBe('14h30');
  });
  it('dateKey theo giờ VN, không theo UTC', () => {
    // 23h30 VN ngày 27 = 16h30 UTC ngày 27 → key vẫn là 27
    expect(toVnDateKey(vnDate('2026-11-27', '23:30'))).toBe('2026-11-27');
    // 01h00 VN ngày 28 = 18h00 UTC ngày 27 → key phải là 28
    expect(toVnDateKey(vnDate('2026-11-28', '01:00'))).toBe('2026-11-28');
  });
  it('compact local cho calendar', () => {
    expect(toCompactLocal(d)).toBe('20261128T143000');
  });
});
