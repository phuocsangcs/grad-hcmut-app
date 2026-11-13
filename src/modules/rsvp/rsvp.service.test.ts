import { describe, expect, it } from 'vitest';
import { createCard, cardRepo } from '@/modules/card';
import { getMyRsvp, listRsvps, removeRsvp, rsvpSummary, submitRsvp } from './rsvp.service';

const mk = (slug: string) =>
  createCard({ displayName: 'Sang', facultyId: 'cse', templateId: 'classic', message: '', greetings: {}, slug });

describe('rsvp.service', () => {
  it('upsert theo clientId: gửi 2 lần chỉ có 1 dòng, số liệu đúng', async () => {
    const { card } = await mk('rsvp-a');
    await submitRsvp('rsvp-a', { clientId: 'client-00000001', guestName: 'Ba', headcount: 2, wish: 'Chúc mừng con', groupKey: 'parents' });
    await submitRsvp('rsvp-a', { clientId: 'client-00000001', guestName: 'Ba Mẹ', headcount: 3, wish: 'Chúc mừng con!', groupKey: 'parents' });
    await submitRsvp('rsvp-a', { clientId: 'client-00000002', guestName: 'Bạn A', headcount: 1 });

    const list = await listRsvps(card.id);
    expect(list).toHaveLength(2);
    expect(list.find((r) => r.clientId === 'client-00000001')).toMatchObject({ guestName: 'Ba Mẹ', headcount: 3 });
    expect(await rsvpSummary(card.id)).toEqual({ responses: 2, guests: 4, wishes: 1 });

    const mine = await getMyRsvp('rsvp-a', 'client-00000001');
    expect(mine?.guestName).toBe('Ba Mẹ');
    expect(await getMyRsvp('rsvp-a', 'nobody-00000000')).toBeNull();
  });

  it('thiệp không tồn tại / bị khoá → 404', async () => {
    await expect(submitRsvp('khong-co', { clientId: 'client-00000001', guestName: 'X', headcount: 1 })).rejects.toMatchObject({ status: 404 });
    const { card } = await mk('rsvp-locked');
    await cardRepo.setLocked(card.id, true);
    await expect(submitRsvp('rsvp-locked', { clientId: 'client-00000001', guestName: 'X', headcount: 1 })).rejects.toMatchObject({ status: 404 });
  });

  it('xoá thiệp → RSVP mất theo (cascade); xoá 1 RSVP', async () => {
    const { card } = await mk('rsvp-del');
    const r = await submitRsvp('rsvp-del', { clientId: 'client-00000001', guestName: 'X', headcount: 1 });
    await submitRsvp('rsvp-del', { clientId: 'client-00000002', guestName: 'Y', headcount: 1 });
    await removeRsvp(card.id, r.id);
    expect(await listRsvps(card.id)).toHaveLength(1);
    await expect(removeRsvp(card.id, r.id)).rejects.toMatchObject({ status: 404 });
    await cardRepo.delete(card.id);
    expect(await listRsvps(card.id)).toHaveLength(0);
  });
});
