import { facultiesFile, getFaculty } from './loaders';
import type { Faculty } from './schema';
import { vnDate } from '@/lib/time';

/** Trình độ / chương trình đào tạo của người nhận bằng. */
export const DEGREES = [
  { id: 'bachelor', label: 'Cử nhân', title: 'Tân Cử nhân' },
  { id: 'engineer', label: 'Kỹ sư', title: 'Tân Kỹ sư' },
  { id: 'master', label: 'Thạc sĩ', title: 'Tân Thạc sĩ' },
  { id: 'phd', label: 'Tiến sĩ', title: 'Tân Tiến sĩ' },
] as const;
export type DegreeId = (typeof DEGREES)[number]['id'];
export const DEGREE_IDS = DEGREES.map((d) => d.id) as [DegreeId, ...DegreeId[]];

export const isDegree = (v: unknown): v is DegreeId => DEGREES.some((d) => d.id === v);
export const isGraduate = (d: DegreeId) => d === 'master' || d === 'phd';
/** Chỉ hệ đại học (Cử nhân/Kỹ sư) mới có chương trình OISP. */
export const canBeOisp = (d: DegreeId) => d === 'bachelor' || d === 'engineer';
export const degreeTitleOf = (d: DegreeId): string => DEGREES.find((x) => x.id === d)!.title;

export type Program = {
  /** Khoa kèm giờ lễ thật sự áp dụng cho chương trình này (màu, hoạ tiết vẫn của khoa). */
  faculty: Faculty;
  at: Date;
  venue: string;
  degreeTitle: string;
  /** Lễ chung của sau đại học / OISP thay vì lễ của khoa. */
  shared: 'graduate' | 'oisp' | null;
};

/**
 * Lễ áp dụng cho (khoa, trình độ, OISP):
 *  - Thạc sĩ / Tiến sĩ → lễ Sau đại học chung cho mọi khoa.
 *  - Cử nhân / Kỹ sư + OISP → lễ OISP chung cho mọi khoa.
 *  - Còn lại → lễ của chính khoa.
 * Bản ghi cũ có facultyId là "grad" / "oisp" vẫn chạy: dùng nguyên lịch của bản ghi đó.
 */
export function resolveProgram(facultyId: string, degree: DegreeId = 'bachelor', oisp = false): Program | undefined {
  const base = getFaculty(facultyId);
  if (!base) return undefined;
  const venueOf = (f: Faculty) => f.venue ?? facultiesFile.defaultVenue;
  if (base.kind !== 'faculty') {
    return { faculty: base, at: vnDate(base.date, base.time), venue: venueOf(base), degreeTitle: base.degreeTitle, shared: base.kind };
  }
  const shared = isGraduate(degree) ? 'graduate' : oisp && canBeOisp(degree) ? 'oisp' : null;
  const sched = shared ? facultiesFile.items.find((f) => f.kind === shared) : undefined;
  if (!sched) return { faculty: { ...base, degreeTitle: degreeTitleOf(degree) }, at: vnDate(base.date, base.time), venue: venueOf(base), degreeTitle: degreeTitleOf(degree), shared: null };
  const title = degreeTitleOf(degree);
  return {
    faculty: { ...base, date: sched.date, time: sched.time, venue: sched.venue, note: sched.note, ...(shared === 'graduate' ? { tagline: sched.tagline, invitation: sched.invitation } : {}), degreeTitle: title },
    at: vnDate(sched.date, sched.time),
    venue: venueOf(sched),
    degreeTitle: title,
    shared,
  };
}
