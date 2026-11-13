import { addMinutes, toCompactLocal, TZ } from '@/lib/time';
import type { CalendarEvent } from './ics';

/** Link "Thêm vào Google Calendar", mở được trong webview Zalo. */
export function googleCalendarUrl(ev: CalendarEvent): string {
  const end = addMinutes(ev.start, ev.durationMinutes ?? 180);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title,
    dates: `${toCompactLocal(ev.start)}/${toCompactLocal(end)}`,
    ctz: TZ,
  });
  if (ev.description) p.set('details', ev.description);
  if (ev.location) p.set('location', ev.location);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
