'use client';

import { useMemo } from 'react';
import type { PublicCard } from '@/modules/card/card.service';
import { countdown, resolveMode } from '@/modules/card/mode';
import { resolveGreeting } from '@/modules/card/greeting';
import { resolveProgram, canBeOisp, type DegreeId, getMusic, getPoi, getTemplate, type Faculty, type Template } from '@/modules/content';

import { InvitationCard, type TemplateLinks } from '@/templates';
import { PhoneFrame } from '@/ui';

export type PreviewDraft = {
  displayName: string;
  facultyId: string;
  degree: DegreeId;
  oisp: boolean;
  templateId: string;
  message: string;
  slug: string;
  meetingPoiId: string;
  meetingTime: string;
  phone: string;
  greetings: Record<string, string>;
  /** URL ảnh để xem trước (đã tải lên R2). */
  photos?: string[];
  beforeTime?: string;
  afterTime?: string;
  musicId?: string;
  rsvpEnabled?: boolean;
  /** ISO hoặc rỗng. */
  rsvpDeadline?: string;
  rsvpMaxHeadcount?: number;
  guestbookEnabled?: boolean;
};

const LINKS: TemplateLinks = { card: '#', qr: '#', googleCalendar: '#', directions: '#', meetingPoi: '#', call: null, messenger: '#' };

/** Dựng PublicCard giả từ nháp để render đúng template thật, không cần server. */
export function draftToCard(d: PreviewDraft, opts: { to?: string; mode?: string } = {}): PublicCard | null {
  const program = resolveProgram(d.facultyId, d.degree, d.oisp && canBeOisp(d.degree));
  const faculty: Faculty | undefined = program?.faculty;
  const template: Template | undefined = getTemplate(d.templateId);
  if (!faculty || !template) return null;
  const at = program!.at;
  const now = new Date();
  const poi = d.meetingPoiId ? getPoi(d.meetingPoiId) : undefined;
  const to = opts.to ?? 'parents';
  return {
    slug: d.slug.trim() || 'ten-cua-ban',
    displayName: d.displayName.trim() || 'Tên của bạn',
    faculty: { id: faculty.id, name: faculty.name, shortName: faculty.shortName },
    degree: d.degree,
    oisp: d.oisp && canBeOisp(d.degree),
    ceremonyAt: at.toISOString(),
    venue: program!.venue,
    template,
    message: d.message,
    greeting: resolveGreeting({ groupKey: to, cardGreetings: d.greetings }),
    groupKey: to,
    recipientName: null,
    meeting: poi ? { poi, time: d.meetingTime || null, note: null } : null,
    phone: d.phone || null,
    photos: d.photos ?? [],
    beforeTime: d.beforeTime?.trim() || null,
    afterTime: d.afterTime?.trim() || null,
    music: (() => {
      const m = d.musicId ? getMusic(d.musicId) : undefined;
      return m ? { id: m.id, title: m.title, artist: m.artist, src: m.src } : null;
    })(),
    rsvp: {
      open: d.rsvpEnabled !== false && !(d.rsvpDeadline && new Date(d.rsvpDeadline).getTime() < now.getTime()),
      reason: d.rsvpEnabled === false ? 'disabled' : d.rsvpDeadline && new Date(d.rsvpDeadline).getTime() < now.getTime() ? 'deadline' : null,
      deadline: d.rsvpDeadline || null,
      maxHeadcount: d.rsvpMaxHeadcount ?? 20,
    },
    wishes: d.guestbookEnabled ? [{ id: 'sample', name: 'Cô Hai', wish: 'Chúc mừng con tốt nghiệp, ba mẹ tự hào về con!' }] : [],
    mode: resolveMode(at, now, opts.mode),
    countdown: countdown(at, now),
    expiresAt: new Date(at.getTime() + 30 * 86_400_000).toISOString(),
  };
}

type Props = {
  draft: PreviewDraft;
  to?: string;
  mode?: string;
  templateId?: string;
  scale?: number;
  className?: string;
  interactive?: boolean;
  /** false → render thiệp trần (toàn màn hình điện thoại), không khung. */
  frame?: boolean;
};

/** Thiệp thật dựng từ nháp; mặc định đặt trong khung điện thoại và thu nhỏ bằng transform. */
export function PhonePreview({ draft, to, mode, templateId, scale = 1, className, interactive = true, frame = true }: Props) {
  const card = useMemo(() => draftToCard({ ...draft, templateId: templateId ?? draft.templateId }, { to, mode }), [draft, to, mode, templateId]);
  if (!card) return null;
  const links = { ...LINKS, call: draft.phone ? `tel:${draft.phone}` : null };
  if (!frame) return <InvitationCard card={card} links={links} preview />;
  return (
    <PhoneFrame scale={scale} className={className} interactive={interactive}>
      <InvitationCard card={card} links={links} preview />
    </PhoneFrame>
  );
}
