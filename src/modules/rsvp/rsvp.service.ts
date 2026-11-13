import { newId } from '@/lib/id';
import { notFound } from '@/lib/http';
import { cardRepo } from '@/modules/card/card.repo';
import { normalizeSlug } from '@/modules/card/slug';
import type { Rsvp } from '@/db/schema';
import { inviteRepo } from '@/modules/invite/invite.repo';
import { isInviteCode } from '@/modules/invite/code';
import { rsvpRepo } from './rsvp.repo';
import type { SubmitRsvpInput } from './rsvp.validators';

export type RsvpSummary = { responses: number; guests: number; wishes: number };

/** Khách xác nhận tham dự. Gửi lại với cùng clientId → cập nhật. */
export async function submitRsvp(slug: string, input: SubmitRsvpInput): Promise<Rsvp> {
  const card = await cardRepo.findBySlug(normalizeSlug(slug));
  if (!card || card.locked || card.expiresAt.getTime() < Date.now()) throw notFound('card_not_found');

  let inviteId: string | null = null;
  let groupKey = input.groupKey ?? null;
  if (input.inviteCode && isInviteCode(input.inviteCode)) {
    const inv = await inviteRepo.findByCode(card.id, input.inviteCode);
    if (inv) {
      inviteId = inv.id;
      groupKey = groupKey ?? inv.groupKey;
    }
  }

  return rsvpRepo.upsert({
    id: newId(),
    cardId: card.id,
    inviteId,
    clientId: input.clientId,
    guestName: input.guestName,
    headcount: input.headcount,
    wish: input.wish || null,
    groupKey,
  });
}

/** Khách mở lại: đã RSVP chưa (để hiện "Đã xác nhận ✓"). */
export async function getMyRsvp(slug: string, clientId: string): Promise<Rsvp | null> {
  const card = await cardRepo.findBySlug(normalizeSlug(slug));
  if (!card) return null;
  return (await rsvpRepo.findByClient(card.id, clientId)) ?? null;
}

export const listRsvps = (cardId: string) => rsvpRepo.listByCard(cardId);
export const rsvpSummary = (cardId: string): Promise<RsvpSummary> => rsvpRepo.summary(cardId);

export async function removeRsvp(cardId: string, rsvpId: string): Promise<void> {
  const ok = await rsvpRepo.delete(cardId, rsvpId);
  if (!ok) throw notFound('rsvp_not_found');
}
