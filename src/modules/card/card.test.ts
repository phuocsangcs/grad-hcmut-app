import { describe, expect, it } from 'vitest';
import { normalizeSlug, suggestSlugs, validateSlug } from './slug';
import { countdown, resolveMode } from './mode';
import { resolveInvitation } from './invitation';
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

describe('invitation', () => {
  it('link mời riêng > thiệp > mặc định', () => {
    expect(resolveInvitation({ inviteLead: 'Kính mời', recipientName: 'Cô Hoa', cardLead: 'Thân mời', cardInvitee: 'Ba Mẹ' })).toEqual({ lead: 'Kính mời', name: 'Cô Hoa' });
    expect(resolveInvitation({ cardLead: 'Thân mời', cardInvitee: 'Ba Mẹ' })).toEqual({ lead: 'Thân mời', name: 'Ba Mẹ' });
    expect(resolveInvitation({ recipientName: 'Minh', cardLead: '  ', cardInvitee: null })).toEqual({ lead: 'Thương mời', name: 'Minh' });
    expect(resolveInvitation({})).toEqual({ lead: 'Thương mời', name: 'Quý khách' });
  });
});
