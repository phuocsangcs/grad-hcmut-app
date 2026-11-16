import { describe, expect, it } from 'vitest';
import { listRealFaculties, resolveProgram } from '.';

describe('resolveProgram', () => {
  it('cử nhân / kỹ sư dùng lễ của khoa', () => {
    const p = resolveProgram('cse', 'engineer', false)!;
    expect(p.shared).toBeNull();
    expect(p.faculty.date).toBe('2026-11-28');
    expect(p.degreeTitle).toBe('Tân Kỹ sư');
  });
  it('thạc sĩ / tiến sĩ dùng lễ Sau đại học chung, giữ màu của khoa', () => {
    for (const d of ['master', 'phd'] as const) {
      const p = resolveProgram('cse', d, false)!;
      expect(p.shared).toBe('graduate');
      expect(p.faculty.date).toBe('2026-11-26');
      expect(p.faculty.accent).toBe(resolveProgram('cse')!.faculty.accent);
    }
  });
  it('OISP chuyển sang lễ OISP, nhưng bị bỏ qua với sau đại học', () => {
    expect(resolveProgram('me', 'bachelor', true)!.faculty.date).toBe('2026-11-29');
    expect(resolveProgram('me', 'master', true)!.shared).toBe('graduate');
  });
  it('danh sách khoa không chứa lễ chung', () => {
    expect(listRealFaculties().some((f) => f.kind !== 'faculty')).toBe(false);
  });
});
