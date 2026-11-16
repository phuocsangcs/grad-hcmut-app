import { newId } from '@/lib/id';
import { badRequest, notFound } from '@/lib/http';
import { getEnv } from '@/lib/env';
import { getTemplate, listTemplates } from '@/modules/content';
import { cardRepo } from '@/modules/card/card.repo';
import { getPublicCard, type PublicCardResult, type PublicViewOptions } from '@/modules/card/card.service';
import { normalizeSlug } from '@/modules/card/slug';
import type { Invite } from '@/db/schema';
import { inviteRepo } from './invite.repo';
import { rsvpRepo } from '@/modules/rsvp/rsvp.repo';
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
      greeting: r.greeting || null,
      message: r.message || null,
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
      greeting: r.greeting,
      message: r.message,
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
    ...(patch.greeting !== undefined && { greeting: patch.greeting || null }),
    ...(patch.message !== undefined && { message: patch.message || null }),
    ...(patch.templateId !== undefined && { templateId: patch.templateId || null }),
  });
  if (!row) throw notFound('invite_not_found');
  return row;
}

export async function removeInvite(cardId: string, id: string): Promise<void> {
  const ok = await inviteRepo.delete(cardId, id);
  if (!ok) throw notFound('invite_not_found');
}

export type InviteStats = { total: number; opened: number; notOpened: number; confirmed: number; pending: number; headcount: number };

/** Số liệu cho trang quản lý khách: chỉ tính khách có link riêng. */
export function inviteStats(list: Pick<InviteWithStatus, 'viewCount' | 'rsvp'>[]): InviteStats {
  const opened = list.filter((i) => i.viewCount > 0).length;
  const confirmed = list.filter((i) => i.rsvp).length;
  return {
    total: list.length,
    opened,
    notOpened: list.length - opened,
    confirmed,
    pending: list.length - confirmed,
    headcount: list.reduce((n, i) => n + (i.rsvp?.headcount ?? 0), 0),
  };
}

/**
 * Báo cáo CSV cho chủ thiệp (mở bằng Excel, có BOM để đọc đúng tiếng Việt).
 * Một bảng gồm khách có link riêng và khách xác nhận qua link chung (cột Nguồn).
 */
export async function exportInvitesCsv(cardSlug: string, cardId: string): Promise<string> {
  const list = await listInvites(cardSlug, cardId);
  const general = (await rsvpRepo.listByCard(cardId)).filter((r) => !r.inviteId);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Tên', 'Nguồn', 'Câu mời', 'Lời nhắn riêng', 'Link', 'Lượt mở', 'Trạng thái', 'Số người', 'Lời chúc'];
  const rows = [
    ...list.map((i) => [
      i.recipientName, 'Link riêng', i.greeting ?? '', i.message ?? '', i.url, i.viewCount,
      i.rsvp ? 'Đã xác nhận' : i.viewCount > 0 ? 'Đã mở, chưa phản hồi' : 'Chưa mở', i.rsvp?.headcount ?? '', i.rsvp?.wish ?? '',
    ]),
    ...general.map((r) => [r.guestName, 'Link chung', '', '', '', '', 'Đã xác nhận', r.headcount, r.wish ?? '']),
  ];
  return '\uFEFF' + [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
}

/** Thiệp cá nhân hoá: /[slug]/[code]. Code sai → not_found (thiệp chung vẫn mở được qua /[slug]). */
export async function getPublicCardByInvite(slug: string, code: string, opts: Omit<PublicViewOptions, 'invite'> = {}): Promise<PublicCardResult> {
  if (!isInviteCode(code)) return { status: 'not_found' };
  const card = await cardRepo.findBySlug(normalizeSlug(slug));
  if (!card) return { status: 'not_found' };
  const inv = await inviteRepo.findByCode(card.id, code);
  if (!inv) return { status: 'not_found' };
  if (!opts.skipView) await inviteRepo.incrementView(inv.id).catch((e) => console.error('incrementView(invite) lỗi', e));
  return getPublicCard(slug, {
    ...opts,
    invite: { recipientName: inv.recipientName, greeting: inv.greeting, message: inv.message, templateId: inv.templateId },
  });
}
