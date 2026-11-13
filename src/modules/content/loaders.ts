import facultiesRaw from '@/content/faculties.json';
import poisRaw from '@/content/pois.json';
import eateriesRaw from '@/content/eateries.json';
import templatesRaw from '@/content/templates.json';
import greetingsRaw from '@/content/greetings.json';
import {
  eateriesFileSchema,
  facultiesFileSchema,
  greetingsFileSchema,
  poisFileSchema,
  templatesFileSchema,
  type Eatery,
  type Faculty,
  type GreetingGroup,
  type Poi,
  type Template,
} from './schema';
import { vnDate } from '@/lib/time';

/**
 * JSON được import tĩnh (bundle vào build) và parse qua Zod đúng một lần.
 * Sai cấu trúc → ném lỗi ngay khi module load, build fail.
 */
function parseOnce<T>(name: string, schema: { parse: (v: unknown) => T }, raw: unknown): T {
  try {
    return schema.parse(raw);
  } catch (err) {
    throw new Error(`src/content/${name}.json không hợp lệ: ${(err as Error).message}`);
  }
}

export const facultiesFile = parseOnce('faculties', facultiesFileSchema, facultiesRaw);
export const poisFile = parseOnce('pois', poisFileSchema, poisRaw);
export const eateriesFile = parseOnce('eateries', eateriesFileSchema, eateriesRaw);
export const templatesFile = parseOnce('templates', templatesFileSchema, templatesRaw);
export const greetingsFile = parseOnce('greetings', greetingsFileSchema, greetingsRaw);

function indexBy<T extends { id: string }>(items: T[]) {
  return new Map(items.map((i) => [i.id, i]));
}
const facultyIndex = indexBy(facultiesFile.items);
const poiIndex = indexBy(poisFile.items);
const eateryIndex = indexBy(eateriesFile.items);
const templateIndex = indexBy(templatesFile.items);
const greetingIndex = new Map(greetingsFile.groups.map((g) => [g.key, g]));

export const listFaculties = (): Faculty[] => facultiesFile.items;
export const getFaculty = (id: string): Faculty | undefined => facultyIndex.get(id);

/** Thời điểm lễ của khoa (Date tuyệt đối) và hội trường mặc định. */
export function getFacultyCeremony(id: string): { at: Date; venue: string } | undefined {
  const f = facultyIndex.get(id);
  if (!f) return undefined;
  return { at: vnDate(f.date, f.time), venue: f.venue ?? facultiesFile.defaultVenue };
}

export const listPois = (): Poi[] => poisFile.items;
export const getPoi = (id: string): Poi | undefined => poiIndex.get(id);
export const listPoisByType = (type: Poi['type']): Poi[] => poisFile.items.filter((p) => p.type === type);
/** POI được phép chọn làm điểm hẹn: chỗ ngồi chờ, góc chụp, cổng, hội trường. */
export const listMeetingPois = (): Poi[] =>
  poisFile.items.filter((p) => ['rest', 'photo', 'gate', 'hall', 'meeting'].includes(p.type));

export const listEateries = (): Eatery[] => eateriesFile.items;
export const getEatery = (id: string): Eatery | undefined => eateryIndex.get(id);

export const listTemplates = (): Template[] => templatesFile.items;
export const getTemplate = (id: string): Template | undefined => templateIndex.get(id);
export const defaultTemplateId = templatesFile.defaultId;

export const listGreetingGroups = (): GreetingGroup[] => greetingsFile.groups;
export const getGreetingGroup = (key: string): GreetingGroup | undefined => greetingIndex.get(key);
export const greetingGroupKeys = (): string[] => greetingsFile.groups.map((g) => g.key);
