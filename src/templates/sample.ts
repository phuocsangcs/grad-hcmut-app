import { countdown, resolveMode } from '@/modules/card/mode';
import type { PublicCard } from '@/modules/card/card.service';
import { getFaculty, getFacultyCeremony, getPoi, getTemplate, listFaculties, listTemplates } from '@/modules/content';
import type { TemplateLinks } from './types';

/**
 * Thiệp mẫu không cần DB — dùng cho /playground, ảnh minh hoạ ở trang chủ, tài liệu.
 * Không dùng cho trang thiệp thật.
 */
export type SampleOptions = {
  templateId?: string;
  facultyId?: string;
  displayName?: string;
  to?: string;
  recipientName?: string | null;
  message?: string;
  mode?: string;
  now?: Date;
};

const GREETINGS: Record<string, string> = { parents: 'Gửi Ba Mẹ,', grandparents: 'Kính gửi Ông Bà,', friends: 'Ê bạn ơi,', family: 'Gửi cả nhà,' };

export function sampleCard(o: SampleOptions = {}): PublicCard {
  const faculty = getFaculty(o.facultyId ?? 'cse') ?? listFaculties()[0];
  const template = getTemplate(o.templateId ?? 'print') ?? listTemplates()[0];
  const ceremony = getFacultyCeremony(faculty.id)!;
  const now = o.now ?? new Date();
  const poi = getPoi('bench-a5');
  const to = o.to ?? 'parents';
  return {
    slug: 'minh-anh-k22',
    displayName: o.displayName ?? 'Nguyễn Minh Anh',
    faculty: { id: faculty.id, name: faculty.name, shortName: faculty.shortName },
    degree: 'bachelor',
    oisp: false,
    ceremonyAt: ceremony.at.toISOString(),
    venue: ceremony.venue,
    template,
    message: o.message ?? '',
    greeting: GREETINGS[to] ?? 'Gửi bạn,',
    groupKey: to,
    recipientName: o.recipientName ?? null,
    meeting: poi ? { poi, time: '16h00', note: null } : null,
    phone: '0901234567',
    photos: [],
    beforeTime: null,
    afterTime: null,
    music: null,
    rsvp: { open: true, reason: null, deadline: null, maxHeadcount: 20 },
    wishes: [],
    mode: resolveMode(ceremony.at, now, o.mode),
    countdown: countdown(ceremony.at, now),
    expiresAt: new Date(ceremony.at.getTime() + 30 * 86_400_000).toISOString(),
  };
}

export const SAMPLE_LINKS: TemplateLinks = {
  card: '/minh-anh-k22',
  ics: '#',
  qr: '#',
  googleCalendar: '#',
  directions: '#',
  meetingPoi: '#',
  call: 'tel:0901234567',
  messenger: '#',
};
