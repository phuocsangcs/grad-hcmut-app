import { addMinutes, toCompactLocal, TZ } from '@/lib/time';

export type CalendarEvent = {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  /** Mặc định 3 giờ */
  durationMinutes?: number;
  url?: string;
  /** Nhắc trước bao nhiêu phút, mặc định 60 */
  alarmMinutes?: number;
};

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Gấp dòng theo RFC 5545 (tối đa 75 octet). */
function fold(line: string): string {
  const out: string[] = [];
  let buf = '';
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > 73) {
      out.push(buf);
      buf = ' ' + ch;
      bytes = 1 + b;
    } else {
      buf += ch;
      bytes += b;
    }
  }
  out.push(buf);
  return out.join('\r\n');
}

/** VTIMEZONE cho Asia/Ho_Chi_Minh: UTC+7 cố định, không DST. */
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${TZ}`,
  'BEGIN:STANDARD',
  'DTSTART:19700101T000000',
  'TZOFFSETFROM:+0700',
  'TZOFFSETTO:+0700',
  'TZNAME:+07',
  'END:STANDARD',
  'END:VTIMEZONE',
];

export function buildIcs(ev: CalendarEvent, now: Date = new Date()): string {
  const end = addMinutes(ev.start, ev.durationMinutes ?? 180);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Thiep Tot Nghiep Bach Khoa//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...VTIMEZONE,
    'BEGIN:VEVENT',
    `UID:${ev.uid}`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;TZID=${TZ}:${toCompactLocal(ev.start)}`,
    `DTEND;TZID=${TZ}:${toCompactLocal(end)}`,
    `SUMMARY:${esc(ev.title)}`,
    ev.description ? `DESCRIPTION:${esc(ev.description)}` : null,
    ev.location ? `LOCATION:${esc(ev.location)}` : null,
    ev.url ? `URL:${ev.url}` : null,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(ev.title)}`,
    `TRIGGER:-PT${ev.alarmMinutes ?? 60}M`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((l): l is string => l !== null);
  return lines.map(fold).join('\r\n') + '\r\n';
}
