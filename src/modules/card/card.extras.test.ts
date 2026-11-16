import { describe, expect, it } from 'vitest';
import { createCard, getPublicCard, updateCard } from './card.service';
import { submitRsvp } from '@/modules/rsvp';
import { fromVnLocalInput, toVnLocalInput } from '@/lib/time';

const base = { displayName: 'Phước Sang', facultyId: 'cse', templateId: 'print', message: '' };
const guest = { clientId: 'client-aaaa-1111', guestName: 'Cô Hai', headcount: 2, wish: 'Chúc mừng con!' };

describe('giờ trước/sau lễ và RSVP nâng cao', () => {
  it('giờ trước/sau lễ là tuỳ chọn, điền thì hiện trên thiệp công khai', async () => {
    const { card } = await createCard({ ...base, slug: 'khong-gio' });
    expect(card.beforeTime).toBeNull();
    const r = await createCard({ ...base, slug: 'co-gio', beforeTime: '07h00 – 07h30', afterTime: '10h30 – 11h30' });
    const res = await getPublicCard('co-gio', { skipView: true });
    expect(res.status).toBe('ok');
    if (res.status === 'ok') {
      expect(res.card.beforeTime).toBe('07h00 – 07h30');
      expect(res.card.afterTime).toBe('10h30 – 11h30');
    }
    expect(r.card.rsvpEnabled).toBe(true);
  });

  it('tắt RSVP hoặc quá hạn → từ chối; vượt số người tối đa → từ chối', async () => {
    await createCard({ ...base, slug: 'tat-rsvp', rsvpEnabled: false });
    await expect(submitRsvp('tat-rsvp', guest)).rejects.toMatchObject({ code: 'rsvp_closed' });

    await createCard({ ...base, slug: 'het-han', rsvpDeadline: new Date(Date.now() - 60_000) });
    await expect(submitRsvp('het-han', guest)).rejects.toMatchObject({ code: 'rsvp_closed' });

    await createCard({ ...base, slug: 'toi-da-2', rsvpMaxHeadcount: 2 });
    await expect(submitRsvp('toi-da-2', { ...guest, headcount: 3 })).rejects.toMatchObject({ code: 'headcount_exceeded' });
    await expect(submitRsvp('toi-da-2', guest)).resolves.toMatchObject({ headcount: 2 });
  });

  it('lưu bút: chỉ hiện khi bật, ẩn được từng lời chúc', async () => {
    const { card } = await createCard({ ...base, slug: 'luu-but' });
    const rsvp = await submitRsvp('luu-but', guest);

    const off = await getPublicCard('luu-but', { skipView: true });
    if (off.status === 'ok') expect(off.card.wishes).toEqual([]);

    await updateCard(card.id, { guestbookEnabled: true });
    const on = await getPublicCard('luu-but', { skipView: true });
    if (on.status === 'ok') expect(on.card.wishes).toEqual([{ id: rsvp.id, name: 'Cô Hai', wish: 'Chúc mừng con!' }]);

    const { setRsvpHidden } = await import('@/modules/rsvp');
    await setRsvpHidden(card.id, rsvp.id, true);
    const hidden = await getPublicCard('luu-but', { skipView: true });
    if (hidden.status === 'ok') expect(hidden.card.wishes).toEqual([]);
  });

  it('sửa thiệp: ảnh cards/ của thiệp khác bị từ chối', async () => {
    const { card } = await createCard({ ...base, slug: 'sua-anh' });
    const alien = `cards/zzzzzzzzzzzz/${'c'.repeat(21)}.jpg`;
    await expect(updateCard(card.id, { photos: [alien] })).rejects.toMatchObject({ code: 'photo_not_found' });
    await expect(updateCard(card.id, { photos: [] })).resolves.toMatchObject({ photos: [] });
  });
});

describe('giờ Việt Nam ↔ ô datetime-local', () => {
  it('đổi qua lại không lệch', () => {
    const iso = fromVnLocalInput('2026-11-20T18:30');
    expect(iso).toBe('2026-11-20T11:30:00.000Z');
    expect(toVnLocalInput(new Date(iso!))).toBe('2026-11-20T18:30');
    expect(fromVnLocalInput('')).toBeNull();
    expect(fromVnLocalInput('abc')).toBeNull();
  });
});
