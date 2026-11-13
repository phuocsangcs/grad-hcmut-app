import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { cards, type Card } from '@/db/schema';
import { getEnv } from '@/lib/env';
import { getEmail } from '@/lib/email';
import { notFound } from '@/lib/http';
import { formatDateVi, formatTimeVi } from '@/lib/time';
import { cardRepo } from '@/modules/card/card.repo';
import { toPublicCard, updateCard, deleteCard, type PublicCard } from '@/modules/card/card.service';
import type { UpdateCardInput } from '@/modules/card/card.validators';
import { listRsvps, rsvpSummary, type RsvpSummary } from '@/modules/rsvp/rsvp.service';
import { hashToken, tokenLooksValid, generateManageToken } from './token';
import type { Rsvp } from '@/db/schema';

/** Tra thiệp từ token. Sai → 404 (không phân biệt "không có" và "sai token"). */
export async function requireCardByToken(token: string): Promise<Card> {
  if (!tokenLooksValid(token)) throw notFound('manage_not_found');
  const card = await cardRepo.findByTokenHash(hashToken(token));
  if (!card) throw notFound('manage_not_found');
  return card;
}

export type ManageOverview = {
  card: Card;
  preview: PublicCard;
  summary: RsvpSummary;
  urls: { card: string; manage: string };
};

export async function getOverview(token: string): Promise<ManageOverview> {
  const card = await requireCardByToken(token);
  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  return {
    card,
    preview: toPublicCard(card, { skipView: true }, new Date()),
    summary: await rsvpSummary(card.id),
    urls: { card: `${base}/${card.slug}`, manage: `${base}/manage/${token}` },
  };
}

export async function listCardRsvps(token: string): Promise<Rsvp[]> {
  const card = await requireCardByToken(token);
  return listRsvps(card.id);
}

export async function updateByToken(token: string, patch: UpdateCardInput): Promise<Card> {
  const card = await requireCardByToken(token);
  return updateCard(card.id, patch);
}

export async function deleteByToken(token: string): Promise<void> {
  const card = await requireCardByToken(token);
  await deleteCard(card.id);
}

/**
 * Lấy lại link quản lý qua email (H6).
 * Token cũ không khôi phục được (chỉ lưu hash) nên sinh token MỚI và thay hash.
 * Luôn trả về thành công để không lộ email nào có trong hệ thống.
 */
export async function sendRecoveryEmail(email: string, slug?: string): Promise<{ sent: number }> {
  const rows = await db.select().from(cards).where(eq(cards.ownerEmail, email));
  const targets = slug ? rows.filter((c) => c.slug === slug) : rows;
  if (targets.length === 0) return { sent: 0 };

  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  const lines: string[] = [];
  for (const c of targets) {
    const token = generateManageToken();
    await cardRepo.update(c.id, { manageTokenHash: hashToken(token) });
    lines.push(
      `• Thiệp "${c.displayName}" – ${formatDateVi(c.ceremonyAt)} ${formatTimeVi(c.ceremonyAt)}\n  Xem: ${base}/${c.slug}\n  Quản lý: ${base}/manage/${token}`,
    );
  }
  await getEmail().send({
    to: email,
    subject: 'Link quản lý thiệp tốt nghiệp của bạn',
    text: `Bạn vừa yêu cầu lấy lại link quản lý. Link cũ đã hết hiệu lực, dùng link mới dưới đây:\n\n${lines.join('\n\n')}\n\nNếu không phải bạn yêu cầu, bỏ qua email này.`,
  });
  return { sent: targets.length };
}
