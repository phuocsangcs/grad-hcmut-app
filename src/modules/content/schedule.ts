import { facultiesFile, listFaculties } from './loaders';
import type { Faculty } from './schema';
import { formatDateVi, vnDate } from '@/lib/time';

export type ScheduleDay = { date: string; label: string; items: (Faculty & { venue: string })[] };

/** Gom lịch theo ngày, giữ thứ tự giờ. Dùng ở trang chủ và /guide. */
export function scheduleByDay(): ScheduleDay[] {
  const days = new Map<string, ScheduleDay>();
  const sorted = [...listFaculties()].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  for (const f of sorted) {
    const day = days.get(f.date) ?? { date: f.date, label: formatDateVi(vnDate(f.date)), items: [] };
    day.items.push({ ...f, venue: f.venue ?? facultiesFile.defaultVenue });
    days.set(f.date, day);
  }
  return [...days.values()];
}

/** Lễ sớm nhất chưa diễn ra (hoặc lễ cuối nếu đã qua hết). */
export function nextCeremony(now = new Date()): { faculty: Faculty; at: Date } {
  const all = listFaculties().map((f) => ({ faculty: f, at: vnDate(f.date, f.time) })).sort((a, b) => a.at.getTime() - b.at.getTime());
  return all.find((c) => c.at.getTime() > now.getTime()) ?? all[all.length - 1];
}
