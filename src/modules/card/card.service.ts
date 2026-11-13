import { newId } from '@/lib/id';
import { badRequest, conflict, notFound } from '@/lib/http';
import { addDays } from '@/lib/time';
import { getFaculty, getFacultyCeremony, getPoi, getTemplate, type Faculty, type Poi, type Template } from '@/modules/content';
import { generateManageToken, hashToken } from '@/modules/manage/token';
import type { Card } from '@/db/schema';
import { cardRepo } from './card.repo';
import { normalizeSlug, suggestSlugs, validateSlug } from './slug';
import { resolveMode, countdown, type CardMode, type Countdown } from './mode';
import { resolveGreeting, normalizeGroupKey } from './greeting';
import type { CreateCardInput, UpdateCardInput } from './card.validators';

/** Thiệp tự xoá sau lễ bao nhiêu ngày (F5). */
export const CARD_TTL_DAYS = 30;

/** Bỏ key rỗng/undefined để lưu jsonb gọn. */
function compactGreetings(g: Partial<Record<string, string>> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(g ?? {})) if (v && v.trim()) out[k] = v.trim();
  return out;
}

// ---------- Tạo thiệp ----------

export type CreateCardResult = { card: Card; manageToken: string };

export async function createCard(input: CreateCardInput): Promise<CreateCardResult> {
  const faculty = getFaculty(input.facultyId);
  if (!faculty) throw badRequest('faculty_not_found');
  if (!getTemplate(input.templateId)) throw badRequest('template_not_found');
  if (input.meetingPoiId && !getPoi(input.meetingPoiId)) throw badRequest('poi_not_found');

  const slug = normalizeSlug(input.slug);
  const problem = validateSlug(slug);
  if (problem) throw badRequest(`slug_${problem}`);
  if (await cardRepo.slugExists(slug)) throw conflict('slug_taken');

  const ceremony = getFacultyCeremony(faculty.id)!;
  const ceremonyAt = input.ceremonyAt ?? ceremony.at;
  const manageToken = generateManageToken();

  const card = await cardRepo.insert({
    id: newId(),
    slug,
    displayName: input.displayName,
    facultyId: faculty.id,
    ceremonyAt,
    venue: input.venue ?? ceremony.venue,
    templateId: input.templateId,
    message: input.message,
    greetings: compactGreetings(input.greetings),
    meetingPoiId: input.meetingPoiId || null,
    meetingTime: input.meetingTime || null,
    meetingNote: input.meetingNote || null,
    phone: input.phone || null,
    manageTokenHash: hashToken(manageToken),
    ownerEmail: input.ownerEmail || null,
    expiresAt: addDays(ceremonyAt, CARD_TTL_DAYS),
  });

  return { card, manageToken };
}

// ---------- Kiểm tra slug ----------

export type SlugCheck =
  | { available: true; slug: string }
  | { available: false; slug: string; reason: 'invalid' | 'reserved' | 'taken'; suggestions: string[] };

export async function checkSlug(raw: string, facultyId?: string): Promise<SlugCheck> {
  const slug = normalizeSlug(raw);
  const problem = validateSlug(slug);
  if (problem) {
    return { available: false, slug, reason: problem, suggestions: await freeSuggestions(slug, facultyId) };
  }
  if (await cardRepo.slugExists(slug)) {
    return { available: false, slug, reason: 'taken', suggestions: await freeSuggestions(slug, facultyId) };
  }
  return { available: true, slug };
}

async function freeSuggestions(base: string, facultyId?: string): Promise<string[]> {
  const cands = suggestSlugs(base, { facultyId });
  const taken = await cardRepo.existingSlugs(cands);
  return cands.filter((c) => !taken.has(c)).slice(0, 3);
}

// ---------- Đọc thiệp công khai ----------

export type PublicCardStatus = 'ok' | 'not_found' | 'locked' | 'expired';

/** Dữ liệu an toàn để render cho khách. Không có token, email, id nội bộ. */
export type PublicCard = {
  slug: string;
  displayName: string;
  faculty: Pick<Faculty, 'id' | 'name' | 'shortName'>;
  ceremonyAt: string;
  venue: string;
  template: Template;
  message: string;
  greeting: string;
  groupKey: string | null;
  recipientName: string | null;
  meeting: { poi: Poi; time: string | null; note: string | null } | null;
  phone: string | null;
  mode: CardMode;
  countdown: Countdown;
  expiresAt: string;
};

export type PublicCardResult = { status: 'ok'; card: PublicCard } | { status: Exclude<PublicCardStatus, 'ok'> };

export type PublicViewOptions = {
  /** ?to= */
  to?: string | null;
  /** ?mode= để test */
  modeOverride?: string | null;
  now?: Date;
  /** Khi mở từ link riêng (Phase 3b) */
  invite?: { recipientName: string; groupKey: string | null; greeting: string | null; templateId: string | null } | null;
  /** Không tăng view_count (ví dụ khi preview trong trang quản lý) */
  skipView?: boolean;
};

export async function getPublicCard(slug: string, opts: PublicViewOptions = {}): Promise<PublicCardResult> {
  const card = await cardRepo.findBySlug(normalizeSlug(slug));
  if (!card) return { status: 'not_found' };
  if (card.locked) return { status: 'locked' };
  const now = opts.now ?? new Date();
  if (card.expiresAt.getTime() < now.getTime()) return { status: 'expired' };

  if (!opts.skipView) await cardRepo.incrementView(card.id).catch((e) => console.error('incrementView(card) lỗi', e));

  return { status: 'ok', card: toPublicCard(card, opts, now) };
}

export function toPublicCard(card: Card, opts: PublicViewOptions, now: Date): PublicCard {
  const faculty = getFaculty(card.facultyId) ?? { id: card.facultyId, name: card.facultyId, shortName: card.facultyId };
  const groupKey = opts.invite?.groupKey ?? normalizeGroupKey(opts.to);
  const templateId = opts.invite?.templateId ?? card.templateId;
  const template = getTemplate(templateId) ?? getTemplate(card.templateId)!;
  const poi = card.meetingPoiId ? getPoi(card.meetingPoiId) : undefined;

  return {
    slug: card.slug,
    displayName: card.displayName,
    faculty: { id: faculty.id, name: faculty.name, shortName: faculty.shortName },
    ceremonyAt: card.ceremonyAt.toISOString(),
    venue: card.venue,
    template,
    message: card.message,
    greeting: resolveGreeting({
      inviteGreeting: opts.invite?.greeting,
      recipientName: opts.invite?.recipientName,
      groupKey,
      cardGreetings: card.greetings,
    }),
    groupKey,
    recipientName: opts.invite?.recipientName ?? null,
    meeting: poi ? { poi, time: card.meetingTime, note: card.meetingNote } : null,
    phone: card.phone,
    mode: resolveMode(card.ceremonyAt, now, opts.modeOverride),
    countdown: countdown(card.ceremonyAt, now),
    expiresAt: card.expiresAt.toISOString(),
  };
}

// ---------- Sửa / xoá (dùng bởi module manage) ----------

export async function updateCard(cardId: string, patch: UpdateCardInput): Promise<Card> {
  if (patch.templateId && !getTemplate(patch.templateId)) throw badRequest('template_not_found');
  if (patch.meetingPoiId && !getPoi(patch.meetingPoiId)) throw badRequest('poi_not_found');

  const data: Partial<Card> = {};
  if (patch.displayName !== undefined) data.displayName = patch.displayName;
  if (patch.ceremonyAt !== undefined) {
    data.ceremonyAt = patch.ceremonyAt;
    data.expiresAt = addDays(patch.ceremonyAt, CARD_TTL_DAYS);
  }
  if (patch.venue !== undefined) data.venue = patch.venue;
  if (patch.templateId !== undefined) data.templateId = patch.templateId;
  if (patch.message !== undefined) data.message = patch.message;
  if (patch.greetings !== undefined) data.greetings = compactGreetings(patch.greetings);
  if (patch.meetingPoiId !== undefined) data.meetingPoiId = patch.meetingPoiId || null;
  if (patch.meetingTime !== undefined) data.meetingTime = patch.meetingTime || null;
  if (patch.meetingNote !== undefined) data.meetingNote = patch.meetingNote || null;
  if (patch.phone !== undefined) data.phone = patch.phone || null;
  if (patch.ownerEmail !== undefined) data.ownerEmail = patch.ownerEmail || null;

  const row = await cardRepo.update(cardId, data);
  if (!row) throw notFound('card_not_found');
  return row;
}

export async function deleteCard(cardId: string): Promise<void> {
  const ok = await cardRepo.delete(cardId);
  if (!ok) throw notFound('card_not_found');
}
