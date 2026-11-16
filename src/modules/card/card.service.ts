import { newId } from '@/lib/id';
import { badRequest, conflict, notFound } from '@/lib/http';
import { addDays } from '@/lib/time';
import { adoptPending, deleteKeys, isStorageEnabled, publicUrl, verifyPending } from '@/lib/storage';
import { CARD_KEY_RE, PENDING_KEY_RE } from '@/lib/storage-keys';
import { canBeOisp, getFaculty, getMusic, resolveProgram, type DegreeId, getPoi, getTemplate, type Faculty, type Poi, type Template } from '@/modules/content';
import { rsvpRepo } from '@/modules/rsvp/rsvp.repo';
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
  if (input.musicId && !getMusic(input.musicId)) throw badRequest('music_not_found');

  const slug = normalizeSlug(input.slug);
  const problem = validateSlug(slug);
  if (problem) throw badRequest(`slug_${problem}`);
  if (await cardRepo.slugExists(slug)) throw conflict('slug_taken');

  const degree = input.degree ?? 'bachelor';
  const oisp = !!input.oisp && canBeOisp(degree);
  const ceremony = resolveProgram(faculty.id, degree, oisp)!;
  const ceremonyAt = input.ceremonyAt ?? ceremony.at;
  const manageToken = generateManageToken();
  const id = newId();

  // Ảnh: kiểm tra file đã lên R2 rồi chuyển vào thư mục của thiệp.
  const pending = [...new Set(input.photos ?? [])];
  let photos: string[] = [];
  if (pending.length > 0) {
    if (!isStorageEnabled()) throw badRequest('storage_disabled');
    const okAll = await Promise.all(pending.map(verifyPending));
    if (okAll.some((v) => !v)) throw badRequest('photo_missing');
    photos = await Promise.all(pending.map((k) => adoptPending(k, id)));
  }

  const card = await cardRepo.insert({
    id,
    slug,
    displayName: input.displayName,
    facultyId: faculty.id,
    degree,
    oisp,
    ceremonyAt,
    venue: input.venue ?? ceremony.venue,
    templateId: input.templateId,
    message: input.message,
    greetings: compactGreetings(input.greetings),
    meetingPoiId: input.meetingPoiId || null,
    meetingTime: input.meetingTime || null,
    meetingNote: input.meetingNote || null,
    phone: input.phone || null,
    photos,
    beforeTime: input.beforeTime || null,
    afterTime: input.afterTime || null,
    musicId: input.musicId || null,
    rsvpEnabled: input.rsvpEnabled ?? true,
    rsvpDeadline: input.rsvpDeadline ?? null,
    rsvpMaxHeadcount: input.rsvpMaxHeadcount ?? 20,
    guestbookEnabled: input.guestbookEnabled ?? false,
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
  degree: DegreeId;
  /** Học chương trình OISP (dự lễ OISP chung). */
  oisp: boolean;
  ceremonyAt: string;
  venue: string;
  template: Template;
  message: string;
  greeting: string;
  groupKey: string | null;
  recipientName: string | null;
  meeting: { poi: Poi; time: string | null; note: string | null } | null;
  phone: string | null;
  /** URL công khai của ảnh; phần tử đầu là ảnh bìa. */
  photos: string[];
  /** Giờ đón khách trước lễ / gặp sau lễ (tuỳ chọn). */
  beforeTime: string | null;
  afterTime: string | null;
  music: { id: string; title: string; artist?: string; src: string } | null;
  /** Trạng thái nhận xác nhận tham dự. */
  rsvp: { open: boolean; reason: 'disabled' | 'deadline' | null; deadline: string | null; maxHeadcount: number };
  /** Lời chúc công khai (lưu bút); rỗng nếu chủ thiệp không bật. */
  wishes: { id: string; name: string; wish: string }[];
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

  return { status: 'ok', card: toPublicCard(card, opts, now, await loadWishes(card)) };
}

/** Lưu bút: chỉ đọc DB khi chủ thiệp bật. */
export async function loadWishes(card: Card): Promise<PublicCard['wishes']> {
  if (!card.guestbookEnabled) return [];
  const rows = await rsvpRepo.listWishes(card.id);
  return rows.flatMap((r) => (r.wish ? [{ id: r.id, name: r.name, wish: r.wish }] : []));
}

function rsvpState(card: Card, now: Date): PublicCard['rsvp'] {
  const late = card.rsvpDeadline ? card.rsvpDeadline.getTime() < now.getTime() : false;
  return {
    open: card.rsvpEnabled && !late,
    reason: !card.rsvpEnabled ? 'disabled' : late ? 'deadline' : null,
    deadline: card.rsvpDeadline ? card.rsvpDeadline.toISOString() : null,
    maxHeadcount: card.rsvpMaxHeadcount,
  };
}

export function toPublicCard(card: Card, opts: PublicViewOptions, now: Date, wishes: PublicCard['wishes'] = []): PublicCard {
  const faculty = getFaculty(card.facultyId) ?? { id: card.facultyId, name: card.facultyId, shortName: card.facultyId };
  const groupKey = opts.invite?.groupKey ?? normalizeGroupKey(opts.to);
  const templateId = opts.invite?.templateId ?? card.templateId;
  const template = getTemplate(templateId) ?? getTemplate(card.templateId)!;
  const poi = card.meetingPoiId ? getPoi(card.meetingPoiId) : undefined;

  return {
    slug: card.slug,
    displayName: card.displayName,
    faculty: { id: faculty.id, name: faculty.name, shortName: faculty.shortName },
    degree: card.degree as DegreeId,
    oisp: card.oisp,
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
    photos: (card.photos ?? []).map(publicUrl).filter(Boolean),
    beforeTime: card.beforeTime,
    afterTime: card.afterTime,
    music: (() => {
      const m = card.musicId ? getMusic(card.musicId) : undefined;
      return m ? { id: m.id, title: m.title, artist: m.artist, src: m.src } : null;
    })(),
    rsvp: rsvpState(card, now),
    wishes,
    mode: resolveMode(card.ceremonyAt, now, opts.modeOverride),
    countdown: countdown(card.ceremonyAt, now),
    expiresAt: card.expiresAt.toISOString(),
  };
}

// ---------- Sửa / xoá (dùng bởi module manage) ----------

export async function updateCard(cardId: string, patch: UpdateCardInput): Promise<Card> {
  if (patch.templateId && !getTemplate(patch.templateId)) throw badRequest('template_not_found');
  if (patch.meetingPoiId && !getPoi(patch.meetingPoiId)) throw badRequest('poi_not_found');
  if (patch.musicId && !getMusic(patch.musicId)) throw badRequest('music_not_found');

  const current = await cardRepo.findById(cardId);
  if (!current) throw notFound('card_not_found');

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
  if (patch.beforeTime !== undefined) data.beforeTime = patch.beforeTime || null;
  if (patch.afterTime !== undefined) data.afterTime = patch.afterTime || null;
  if (patch.musicId !== undefined) data.musicId = patch.musicId || null;
  if (patch.rsvpEnabled !== undefined) data.rsvpEnabled = patch.rsvpEnabled;
  if (patch.rsvpDeadline !== undefined) data.rsvpDeadline = patch.rsvpDeadline ?? null;
  if (patch.rsvpMaxHeadcount !== undefined) data.rsvpMaxHeadcount = patch.rsvpMaxHeadcount;
  if (patch.guestbookEnabled !== undefined) data.guestbookEnabled = patch.guestbookEnabled;
  if (patch.photos !== undefined) data.photos = await resolvePhotos(cardId, current.photos ?? [], patch.photos);

  const row = await cardRepo.update(cardId, data);
  if (!row) throw notFound('card_not_found');
  // Ảnh bị gỡ khỏi thiệp thì xoá khỏi R2 (sau khi DB đã cập nhật).
  if (data.photos) {
    const gone = (current.photos ?? []).filter((k) => !data.photos!.includes(k));
    if (gone.length) await deleteKeys(gone);
  }
  return row;
}

/**
 * Danh sách ảnh mong muốn → danh sách khoá thật, giữ thứ tự (ảnh đầu là ảnh bìa).
 * cards/... chỉ được là ảnh sẵn có của chính thiệp này; pending/... được kiểm tra rồi chép vào thiệp.
 */
async function resolvePhotos(cardId: string, current: string[], wanted: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const key of [...new Set(wanted)]) {
    if (CARD_KEY_RE.test(key)) {
      if (!key.startsWith(`cards/${cardId}/`) || !current.includes(key)) throw badRequest('photo_not_found');
      out.push(key);
    } else if (PENDING_KEY_RE.test(key)) {
      if (!isStorageEnabled()) throw badRequest('storage_disabled');
      if (!(await verifyPending(key))) throw badRequest('photo_missing');
      out.push(await adoptPending(key, cardId));
    } else {
      throw badRequest('photo_invalid');
    }
  }
  return out;
}

export async function deleteCard(cardId: string): Promise<void> {
  const card = await cardRepo.findById(cardId);
  const ok = await cardRepo.delete(cardId);
  if (!ok) throw notFound('card_not_found');
  if (card?.photos?.length) await deleteKeys(card.photos);
}
