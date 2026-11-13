import { describe, expect, it } from 'vitest';
import {
  defaultTemplateId,
  eateriesFileSchema,
  filterEateries,
  getFacultyCeremony,
  getGreetingGroup,
  getTemplate,
  listEateries,
  listFaculties,
  listMeetingPois,
  listPois,
  listTemplates,
  poisFile,
} from './index';

describe('content: faculties', () => {
  it('có dữ liệu và id duy nhất', () => {
    const ids = listFaculties().map((f) => f.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('tính được thời điểm lễ theo giờ VN', () => {
    const c = getFacultyCeremony('cse')!;
    expect(c.venue).toBe('Hội trường A5');
    expect(c.at.toISOString()).toBe('2026-11-28T07:30:00.000Z');
  });
  it('khoa không tồn tại → undefined', () => {
    expect(getFacultyCeremony('nope')).toBeUndefined();
  });
});

describe('content: pois', () => {
  it('toạ độ nằm trong khung SVG', () => {
    const { width, height } = poisFile.campus.mapSvg;
    for (const p of listPois()) {
      expect(p.x).toBeLessThanOrEqual(width);
      expect(p.y).toBeLessThanOrEqual(height);
    }
  });
  it('có hội trường A5 và điểm hẹn', () => {
    expect(listPois().some((p) => p.id === 'a5')).toBe(true);
    expect(listMeetingPois().length).toBeGreaterThan(0);
  });
});

describe('content: eateries', () => {
  it('lọc theo ngân sách + nhóm đông', () => {
    const r = filterEateries({ budget: 'mid', bigGroup: true });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((e) => e.budget === 'mid' && e.bigGroup)).toBe(true);
  });
  it('không filter → trả hết, sắp theo khoảng cách', () => {
    const r = filterEateries();
    expect(r.length).toBe(listEateries().length);
    for (let i = 1; i < r.length; i++) expect(r[i].distanceMin).toBeGreaterThanOrEqual(r[i - 1].distanceMin);
  });
  it('schema bắt lỗi budget sai', () => {
    const bad = { updatedAt: '2026-01-01', budgets: {}, items: [{ id: 'x', name: 'x', cuisine: 'x', budget: 'free', bigGroup: true, carParking: true, distanceMin: 1, address: 'x', mapsQuery: 'x' }] };
    expect(() => eateriesFileSchema.parse(bad)).toThrow();
  });
});

describe('content: templates & greetings', () => {
  it('defaultId tồn tại trong danh sách', () => {
    expect(getTemplate(defaultTemplateId)).toBeDefined();
    expect(listTemplates().length).toBeGreaterThanOrEqual(1);
  });
  it('preset nhóm khách', () => {
    expect(getGreetingGroup('parents')?.greeting).toBe('Gửi Ba Mẹ,');
    expect(getGreetingGroup('nope')).toBeUndefined();
  });
});
