import { describe, expect, it } from 'vitest';
import { normalizeSlug, suggestSlugs, validateSlug } from './slug';
import { countdown, resolveMode } from './mode';
import { resolveGreeting, normalizeGroupKey } from './greeting';
import { vnDate } from '@/lib/time';

describe('slug', () => {
  it('bỏ dấu tiếng Việt và ký tự lạ', () => {
    expect(normalizeSlug('Phước Sang K21!')).toBe('phuoc-sang-k21');
    expect(normalizeSlug('  Đặng  Văn  Ngữ ')).toBe('dang-van-ngu');
  });
  it('validate', () => {
    expect(validateSlug('sang-k21')).toBeNull();
    expect(validateSlug('ab')).toBe('invalid');
    expect(validateSlug('Sang')).toBe('invalid');
    expect(validateSlug('a--b')).toBe('invalid');
    expect(validateSlug('create')).toBe('reserved');
    expect(validateSlug('api')).toBe('reserved');
  });
  it('gợi ý khi trùng', () => {
    const s = suggestSlugs('sang', { facultyId: 'cse', year: 2026 });
    expect(s[0]).toBe('sang-cse');
    expect(s).toContain('sang-2026');
    expect(s).toContain('sang-k22');
    expect(new Set(s).size).toBe(s.length);
  });
});

describe('mode', () => {
  const ceremony = vnDate('2026-11-28', '14:30');
  it('before / dayof / after theo ngày VN', () => {
    expect(resolveMode(ceremony, vnDate('2026-11-27', '23:59'))).toBe('before');
    expect(resolveMode(ceremony, vnDate('2026-11-28', '00:00'))).toBe('dayof');
    expect(resolveMode(ceremony, vnDate('2026-11-28', '23:59'))).toBe('dayof');
    expect(resolveMode(ceremony, vnDate('2026-11-29', '00:00'))).toBe('after');
  });
  it('ranh giới ngày tính theo VN, không theo UTC', () => {
    // 28/11 01:00 VN = 27/11 18:00 UTC → vẫn là dayof
    expect(resolveMode(ceremony, new Date('2026-11-27T18:00:00Z'))).toBe('dayof');
  });
  it('?mode= override', () => {
    expect(resolveMode(ceremony, vnDate('2026-01-01'), 'dayof')).toBe('dayof');
    expect(resolveMode(ceremony, vnDate('2026-01-01'), 'xyz')).toBe('before');
  });
  it('countdown', () => {
    expect(countdown(ceremony, vnDate('2026-11-28', '12:30'))).toEqual({ kind: 'hours', hours: 2, minutes: 0 });
    expect(countdown(ceremony, vnDate('2026-11-28', '14:00'))).toEqual({ kind: 'minutes', minutes: 30 });
    expect(countdown(ceremony, vnDate('2026-11-28', '15:00'))).toEqual({ kind: 'started', minutesAgo: 30 });
    expect(countdown(ceremony, vnDate('2026-11-20', '14:30'))).toEqual({ kind: 'days', days: 8 });
  });
});

describe('greeting', () => {
  it('ưu tiên lời chào riêng > override nhóm > preset > tên > mặc định', () => {
    expect(resolveGreeting({ inviteGreeting: 'Má ơi,', groupKey: 'parents' })).toBe('Má ơi,');
    expect(resolveGreeting({ groupKey: 'parents', cardGreetings: { parents: 'Ba mẹ yêu quý,' } })).toBe('Ba mẹ yêu quý,');
    expect(resolveGreeting({ groupKey: 'parents' })).toBe('Gửi Ba Mẹ,');
    expect(resolveGreeting({ recipientName: 'Cô Hoa' })).toBe('Gửi Cô Hoa,');
    expect(resolveGreeting({})).toBe('Gửi bạn,');
    expect(resolveGreeting({ groupKey: 'unknown', recipientName: 'Cô Hoa' })).toBe('Gửi Cô Hoa,');
  });
  it('normalizeGroupKey', () => {
    expect(normalizeGroupKey('friends')).toBe('friends');
    expect(normalizeGroupKey('hack')).toBeNull();
    expect(normalizeGroupKey(null)).toBeNull();
  });
});
