import { getEnv } from '@/lib/env';
import { getPoi, poisFile } from '@/modules/content';
import type { PublicCard } from '@/modules/card/card.service';
import { buildIcs, type CalendarEvent } from './ics';
import { googleCalendarUrl } from './calendar-link';
import { directionsToCampusUrl, messengerShareUrl, poiSearchUrl, telUrl } from './maps-link';

export function cardEvent(c: PublicCard): CalendarEvent {
  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  const meeting = c.meeting ? `Điểm hẹn: ${c.meeting.poi.name}${c.meeting.time ? ` lúc ${c.meeting.time}` : ''}.` : '';
  return {
    uid: `card-${c.slug}@${new URL(base).hostname}`,
    title: `Lễ tốt nghiệp của ${c.displayName}`,
    description: [c.faculty.name, meeting, `Thiệp: ${base}/${c.slug}`].filter(Boolean).join('\n'),
    location: `${c.venue}, ${poisFile.campus.name}, ${poisFile.campus.address}`,
    start: new Date(c.ceremonyAt),
    url: `${base}/${c.slug}`,
  };
}

export const cardIcs = (c: PublicCard) => buildIcs(cardEvent(c));

/** Tập link hành động cho trang thiệp; UI chỉ render, không tự ghép URL. */
export type ShareLinks = {
  card: string;
  ics: string;
  qr: string;
  googleCalendar: string;
  directions: string;
  meetingPoi: string | null;
  call: string | null;
  messenger: string;
};

export function shareLinks(c: PublicCard, inviteCode?: string | null): ShareLinks {
  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  const path = inviteCode ? `/${c.slug}/${inviteCode}` : `/${c.slug}`;
  const card = `${base}${path}`;
  const poi = c.meeting ? getPoi(c.meeting.poi.id) : undefined;
  return {
    card,
    ics: `${base}/api/cards/${c.slug}/ics`,
    qr: `${base}/api/cards/${c.slug}/qr${inviteCode ? `?code=${inviteCode}` : ''}`,
    googleCalendar: googleCalendarUrl(cardEvent(c)),
    directions: directionsToCampusUrl(),
    meetingPoi: poi ? poiSearchUrl(poi) : null,
    call: c.phone ? telUrl(c.phone) : null,
    messenger: messengerShareUrl(card),
  };
}
