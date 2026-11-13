import { z } from 'zod';

const idSchema = z.string().regex(/^[a-z0-9-]+$/, 'id chỉ gồm a-z, 0-9, -');
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dạng YYYY-MM-DD');
const timeKey = z.string().regex(/^\d{2}:\d{2}$/, 'dạng HH:mm');

export const facultySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  shortName: z.string().min(1),
  date: dateKey,
  time: timeKey,
  venue: z.string().optional(),
  note: z.string().optional(),
});
export const facultiesFileSchema = z.object({
  source: z.string(),
  updatedAt: dateKey,
  defaultVenue: z.string().min(1),
  items: z.array(facultySchema).min(1),
});

export const poiTypeSchema = z.enum(['hall', 'restroom', 'parking', 'water', 'rest', 'photo', 'gate', 'meeting']);
export const poiSchema = z.object({
  id: idSchema,
  type: poiTypeSchema,
  name: z.string().min(1),
  x: z.number().min(0),
  y: z.number().min(0),
  image: z.string().optional(),
  note: z.string().optional(),
});
export const poisFileSchema = z.object({
  updatedAt: dateKey,
  campus: z.object({
    name: z.string(),
    address: z.string(),
    gate: z.object({ lat: z.number(), lng: z.number(), label: z.string() }),
    mapSvg: z.object({ width: z.number().positive(), height: z.number().positive() }),
  }),
  types: z.record(poiTypeSchema, z.string()),
  items: z.array(poiSchema).min(1),
});

export const budgetSchema = z.enum(['low', 'mid', 'high']);
export const eaterySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  cuisine: z.string().min(1),
  budget: budgetSchema,
  bigGroup: z.boolean(),
  carParking: z.boolean(),
  distanceMin: z.number().int().positive(),
  address: z.string().min(1),
  mapsQuery: z.string().min(1),
  note: z.string().optional(),
});
export const eateriesFileSchema = z.object({
  updatedAt: dateKey,
  budgets: z.record(budgetSchema, z.string()),
  items: z.array(eaterySchema).min(1),
});

export const templateSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  description: z.string(),
  tone: z.enum(['formal', 'warm', 'modern', 'fun']),
  ogImage: z.string(),
});
export const templatesFileSchema = z.object({
  updatedAt: dateKey,
  defaultId: idSchema,
  items: z.array(templateSchema).min(1),
});

export const greetingGroupSchema = z.object({
  key: idSchema,
  label: z.string().min(1),
  greeting: z.string().min(1),
  message: z.string().min(1),
});
export const greetingsFileSchema = z.object({
  updatedAt: dateKey,
  defaultGreeting: z.string().min(1),
  defaultMessage: z.string().min(1),
  groups: z.array(greetingGroupSchema).min(1),
  messageSuggestions: z.array(z.string()),
});

export type Faculty = z.infer<typeof facultySchema>;
export type Poi = z.infer<typeof poiSchema>;
export type PoiType = z.infer<typeof poiTypeSchema>;
export type Eatery = z.infer<typeof eaterySchema>;
export type Budget = z.infer<typeof budgetSchema>;
export type Template = z.infer<typeof templateSchema>;
export type GreetingGroup = z.infer<typeof greetingGroupSchema>;
export type FacultiesFile = z.infer<typeof facultiesFileSchema>;
export type PoisFile = z.infer<typeof poisFileSchema>;
export type EateriesFile = z.infer<typeof eateriesFileSchema>;
export type TemplatesFile = z.infer<typeof templatesFileSchema>;
export type GreetingsFile = z.infer<typeof greetingsFileSchema>;
