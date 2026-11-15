import type { PublicCard } from '@/modules/card';
import { getFaculty, getGreetingGroup, getPoi, type Faculty } from '@/modules/content';
import { poiSearchUrl } from '@/modules/share/maps-link';
import { getTemplateDefinition } from './registry';
import type { TemplateBlocks, TemplateLinks } from './types';
import { Actions } from './shared/Actions';
import { After } from './shared/After';
import { CeremonyInfo } from './shared/CeremonyInfo';
import { Countdown } from './shared/Countdown';
import { DayOfView } from './shared/DayOfView';
import { Explore } from './shared/Explore';
import { Gallery } from './shared/Gallery';
import { Guestbook, RsvpClosed } from './shared/Guestbook';
import { MusicPlayer } from './shared/MusicPlayer';
import { TimesInfo } from './shared/TimesInfo';
import { MeetingPoint } from './shared/MeetingPoint';
import { Rsvp } from './shared/Rsvp';

type Props = {
  card: PublicCard;
  links: TemplateLinks;
  inviteCode?: string;
  /** Xem trước trong wizard: không gọi API, link khám phá bị vô hiệu. */
  preview?: boolean;
  /** Ép template (xem trước) thay cho card.template.id. */
  templateId?: string;
};

/** Nhãn nút RSVP theo nhóm khách. */
function rsvpCta(groupKey: string | null, recipientName: string | null): string {
  if (recipientName) return `${recipientName} sẽ đến`;
  const label = groupKey ? getGreetingGroup(groupKey)?.label : null;
  if (label === 'Bạn bè') return 'Tới chứ, tới!';
  return label ? `${label} sẽ đến` : 'Mình sẽ đến';
}

/** Khoa có thể thiếu trong JSON (dữ liệu cũ) → dựng bản dự phòng để không vỡ thiệp. */
function resolveFaculty(card: PublicCard): Faculty {
  return (
    getFaculty(card.faculty.id) ?? {
      id: card.faculty.id,
      name: card.faculty.name,
      shortName: card.faculty.shortName,
      code: card.faculty.shortName.slice(0, 4).toUpperCase(),
      date: card.ceremonyAt.slice(0, 10),
      time: '00:00',
      degreeTitle: 'Tân Cử nhân',
      tagline: 'Bốn năm, một tấm bằng.',
      invitation: 'Mời mọi người đến chung vui ngày con nhận bằng.',
      accent: '#032b91',
      soft: '#e8f3fc',
      motif: 'generic',
    }
  );
}

/**
 * Điểm vào duy nhất để vẽ một thiệp.
 * - Chuẩn bị `blocks` (RSVP, đếm ngược, điểm hẹn…) một lần, dùng cho mọi template.
 * - mode `dayof` dùng giao diện chỉ dẫn chung; `before`/`after` dùng template đã chọn.
 */
export function InvitationCard({ card, links, inviteCode, preview, templateId }: Props) {
  const faculty = resolveFaculty(card);
  const def = getTemplateDefinition(templateId ?? card.template.id);
  const message = card.message.trim() || faculty.invitation;
  const meetingPoi = card.meeting ? getPoi(card.meeting.poi.id) : undefined;

  const blocks: TemplateBlocks = {
    ceremony: <CeremonyInfo ceremonyAt={card.ceremonyAt} venue={card.venue} />,
    countdown: <Countdown ceremonyAt={card.ceremonyAt} initial={card.countdown} />,
    rsvp:
      card.mode === 'after' ? null : card.rsvp.open ? (
        <Rsvp slug={card.slug} groupKey={card.groupKey} recipientName={card.recipientName} inviteCode={inviteCode} cta={rsvpCta(card.groupKey, card.recipientName)} maxHeadcount={card.rsvp.maxHeadcount} preview={preview} />
      ) : card.rsvp.reason === 'deadline' ? (
        <RsvpClosed deadline={card.rsvp.deadline} />
      ) : null,
    times: card.beforeTime || card.afterTime ? <TimesInfo beforeTime={card.beforeTime} afterTime={card.afterTime} /> : null,
    guestbook: card.wishes.length > 0 ? <Guestbook wishes={card.wishes} /> : null,
    meeting: card.meeting ? <MeetingPoint meeting={card.meeting} mapsUrl={meetingPoi ? poiSearchUrl(meetingPoi) : links.meetingPoi} /> : null,
    gallery: card.photos.length > 0 ? <Gallery photos={card.photos} name={card.displayName} /> : null,
    actions: <Actions links={links} displayName={card.displayName} />,
    after: card.mode === 'after' ? <After displayName={card.displayName} expiresAt={card.expiresAt} /> : null,
    explore: <Explore slug={card.slug} preview={preview} />,
  };

  const music = card.music ? <MusicPlayer src={card.music.src} title={card.music.title} artist={card.music.artist} preview={preview} /> : null;

  if (card.mode === 'dayof') {
    return (
      <>
        <DayOfView card={card} faculty={faculty} links={links} blocks={blocks} preview={preview} />
        {music}
      </>
    );
  }

  const { Component } = def;
  return (
    <div data-template={def.id} data-scheme={def.scheme} data-mode={card.mode} data-preview={preview ? '' : undefined}>
      <Component card={card} faculty={faculty} links={links} blocks={blocks} message={message} preview={preview} />
      {music}
    </div>
  );
}
