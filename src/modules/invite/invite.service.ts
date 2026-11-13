import { newId } from '@/lib/id';
import { badRequest, notFound } from '@/lib/http';
import { getEnv } from '@/lib/env';
import { getTemplate, listTemplates } from '@/modules/content';
import { cardRepo } from '@/modules/card/card.repo';
import { getPublicCard, type PublicCardResult, type PublicViewOptions } from '@/modules/card/card.service';
import { normalizeSlug } from '@/modules/card/slug';
import type { Invite } from '@/db/schema';
import { inviteRepo } from './invite.repo';
import { generateUniqueCodes, isInviteCode } from './code';
import { BULK_MAX_ROWS, parseBulkText, type BulkParseResult, type BulkRow } from './bulk-parser';
import type { BulkCreateInput, UpdateInviteInput } from './invite.validators';

export const INVITES_PER_CARD_MAX = BULK_MAX_ROWS;

const templateIds = () => new Set(listTemplates().map((t) => t.id));

/** Preview: parse text, chưa ghi gì. */
export function previewBulk(text: string): BulkParseResult {
  return parseBulkText(text, templateIds());
}

/** Tạo hàng loạt. Có lỗi dòng nào thì không tạo gì (all-or-nothing). */
export async function bulkCreateInvites(cardId: string, input: BulkCreateInput): Promise<{ created: Invite[]; errors: BulkParseResult['errors'] }> {
  let rows: BulkRow[];
  if ('text' in input) {
    const parsed = previewBulk(input.text);
    if (parsed.errors.length) return { created: [], errors: parsed.errors };
    rows = parsed.rows;
  } else {
    rows = input.rows.map((r) => ({
      recipientName: r.recipientName,
      groupKey: r.groupKey ?? null,
      greeting: r.greeting ?? null,
      templateId: r.templateId ?? null,
    }));
    const bad = rows.find((r) => r.templateId && !getTemplate(r.templateId));
    if (bad) throw badRequest('template_not_found', { templateId: bad.templateId });
  }
  if (rows.length === 0) throw badRequest('no_rows');

  const existing = await inviteRepo.countByCard(cardId);
  if (existing + rows.length > INVITES_PER_CARD_MAX) {
    throw badRequest('too_many_invites', { max: INVITES_PER_CARD_MAX, existing, adding: rows.length });
  }

  const codes = generateUniqueCodes(rows.length, await inviteRepo.codesOf(cardId));
  const startOrder = (await inviteRepo.maxSortOrder(cardId)) + 1;
  const created = await inviteRepo.insertMany(
    rows.map((r, i) => ({
      id: newId(),
      cardId,
      code: codes[i],
      recipientName: r.recipientName,
      groupKey: r.groupKey,
      greeting: r.greeting,
      templateId: r.templateId,
      sortOrder: startOrder + i,
    })),
  );
  return { created, errors: [] };
}

export type InviteWithStatus = Invite & {
  url: string;
  rsvp: { id: string; guestName: string; headcount: number; wish: string | null; createdAt: Date } | null;
};

export async function listInvites(cardSlug: string, cardId: string): Promise<InviteWithStatus[]> {
  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  const rows = await inviteRepo.listWithRsvp(cardId);
  // left join có thể trả nhiều RSVP cho 1 invite (ba và mẹ cùng mở 1 link); gộp lấy dòng đầu, cộng headcount.
  const byId = new Map<string, InviteWithStatus>();
  for (const { invite, rsvp } of rows) {
    const cur = byId.get(invite.id);
    if (!cur) {
      byId.set(invite.id, { ...invite, url: `${base}/${cardSlug}/${invite.code}`, rsvp: rsvp?.id ? rsvp : null });
    } else if (rsvp?.id && cur.rsvp) {
      cur.rsvp = { ...cur.rsvp, headcount: cur.rsvp.headcount + rsvp.headcount };
    }
  }
  return [...byId.values()];
}

export async function updateInvite(cardId: string, id: string, patch: UpdateInviteInput): Promise<Invite> {
  if (patch.templateId && !getTemplate(patch.templateId)) throw badRequest('template_not_found');
  const row = await inviteRepo.update(cardId, id, {
    ...(patch.recipientName !== undefined && { recipientName: patch.recipientName }),
    ...(patch.groupKey !== undefined && { groupKey: patch.groupKey }),
    ...(patch.greeting !== undefined && { greeting: patch.greeting || null }),
    ...(patch.templateId !== undefined && { templateId: patch.templateId || null }),
  });
  if (!row) throw notFound('invite_not_found');
  return row;
}

export async function removeInvite(cardId: string, id: string): Promise<void> {
  const ok = await inviteRepo.delete(cardId, id);
  if (!ok) throw notFound('invite_not_found');
}

/** CSV cho chủ thiệp: mở bằng Excel, có BOM để Excel đọc đúng tiếng Việt. */
export async function exportInvitesCsv(cardSlug: string, cardId: string): Promise<string> {
  const list = await listInvites(cardSlug, cardId);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Tên', 'Nhóm', 'Link', 'Đã mở', 'Đã xác nhận', 'Số người', 'Lời chúc'];
  const lines = list.map((i) =>
    [i.recipientName, i.groupKey ?? '', i.url, i.viewCount > 0 ? 'x' : '', i.rsvp ? 'x' : '', i.rsvp?.headcount ?? '', i.rsvp?.wish ?? ''].map(esc).join(','),
  );
  return '﻿' + [header.map(esc).join(','), ...lines].join('\r\n');
}

/** Thiệp cá nhân hoá: /[slug]/[code]. Code sai → not_found (thiệp chung vẫn mở được qua /[slug]). */
export async function getPublicCardByInvite(slug: string, code: string, opts: Omit<PublicViewOptions, 'invite' | 'to'> = {}): Promise<PublicCardResult> {
  if (!isInviteCode(code)) return { status: 'not_found' };
  const card = await cardRepo.findBySlug(normalizeSlug(slug));
  if (!card) return { status: 'not_found' };
  const inv = await inviteRepo.findByCode(card.id, code);
  if (!inv) return { status: 'not_found' };
  if (!opts.skipView) await inviteRepo.incrementView(inv.id).catch((e) => console.error('incrementView(invite) lỗi', e));
  return getPublicCard(slug, {
    ...opts,
    invite: { recipientName: inv.recipientName, groupKey: inv.groupKey, greeting: inv.greeting, templateId: inv.templateId },
  });
}
