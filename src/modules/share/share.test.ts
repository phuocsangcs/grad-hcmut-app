import { describe, expect, it } from 'vitest';
import { vnDate } from '@/lib/time';
import { createCard, getPublicCard } from '@/modules/card';
import { buildIcs } from './ics';
import { googleCalendarUrl } from './calendar-link';
import { directionsToCampusUrl, telUrl } from './maps-link';
import { renderQr } from './qr';
import { cardIcs, shareLinks } from './share.service';
import { cardMetadata } from './og';

const start = vnDate('2026-11-28', '14:30');

describe('ics', () => {
  it('đúng timezone VN, có alarm, escape và fold dòng dài', () => {
    const ics = buildIcs(
      { uid: 'u1@test', title: 'Lễ; tốt, nghiệp', location: 'A5', start, description: 'x'.repeat(200) },
      new Date('2026-11-01T00:00:00Z'),
    );
    expect(ics).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20261128T143000');
    expect(ics).toContain('DTEND;TZID=Asia/Ho_Chi_Minh:20261128T173000');
    expect(ics).toContain('SUMMARY:Lễ\; tốt\\, nghiệp');
    expect(ics).toContain('TRIGGER:-PT60M');
    expect(ics).toContain('DTSTAMP:20261101T000000Z');
    for (const line of ics.split('\r\n')) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});

describe('links', () => {
  it('google calendar', () => {
    const u = new URL(googleCalendarUrl({ uid: 'x', title: 'Lễ', start, location: 'A5' }));
    expect(u.searchParams.get('dates')).toBe('20261128T143000/20261128T173000');
    expect(u.searchParams.get('ctz')).toBe('Asia/Ho_Chi_Minh');
    expect(u.searchParams.get('location')).toBe('A5');
  });
  it('maps / tel', () => {
    expect(directionsToCampusUrl()).toContain('destination=10.772');
    expect(telUrl('090 123 4567')).toBe('tel:0901234567');
  });
});

describe('qr', () => {
  it('png và svg', async () => {
    const png = await renderQr('http://localhost:3000/abc', 'png', 256);
    expect(png.contentType).toBe('image/png');
    expect((png.body as Buffer).subarray(1, 4).toString()).toBe('PNG');
    const svg = await renderQr('http://localhost:3000/abc', 'svg');
    expect(svg.body).toContain('<svg');
  });
});

describe('share.service với thiệp thật', () => {
  it('ics, links và metadata', async () => {
    await createCard({ displayName: 'Sang', facultyId: 'cse', templateId: 'classic', message: '', greetings: {}, slug: 'share-a', phone: '0901234567', meetingPoiId: 'bench-a5', meetingTime: '16h00' });
    const r = await getPublicCard('share-a', { skipView: true });
    if (r.status !== 'ok') throw new Error();
    const ics = cardIcs(r.card).replace(/\r\n /g, ''); // unfold
    expect(ics).toContain('UID:card-share-a@localhost');
    expect(ics).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20261128T143000');
    expect(ics).toContain('Điểm hẹn: Ghế đá hàng cây trước A5 lúc 16h00');

    const l = shareLinks(r.card, 'abcdef');
    expect(l.card).toBe('http://localhost:3000/share-a/abcdef');
    expect(l.qr).toBe('http://localhost:3000/api/cards/share-a/qr?code=abcdef');
    expect(l.call).toBe('tel:0901234567');
    expect(l.meetingPoi).toContain('Gh%E1%BA%BF');

    const m = cardMetadata(r.card, '/share-a');
    expect(m.title).toBe('Sang mời bạn dự lễ tốt nghiệp');
    expect(m.description).toContain('Thứ Bảy, 28/11/2026 · 14h30 · Hội trường A5');
    expect(m.robots).toEqual({ index: false, follow: false });
  });
});
