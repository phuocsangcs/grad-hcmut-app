import { z } from 'zod';
import { greetingGroupKeys } from '@/modules/content';
import { SLUG_MAX, SLUG_MIN } from './slug';

const phone = z.string().trim().regex(/^(\+84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ');
const groupKeys = greetingGroupKeys() as [string, ...string[]];

export const createCardSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  facultyId: z.string().min(1),
  /** Cho phép sửa giờ lễ; bỏ trống → lấy từ khoa */
  ceremonyAt: z.coerce.date().optional(),
  venue: z.string().trim().min(1).max(80).optional(),
  templateId: z.string().min(1),
  message: z.string().trim().max(500).default(''),
  greetings: z.record(z.enum(groupKeys), z.string().trim().max(200)).default({}),
  meetingPoiId: z.string().optional().nullable(),
  meetingTime: z.string().trim().max(20).optional().nullable(),
  meetingNote: z.string().trim().max(200).optional().nullable(),
  phone: phone.optional().nullable().or(z.literal('')),
  slug: z.string().trim().min(SLUG_MIN).max(SLUG_MAX),
  ownerEmail: z.string().trim().email().optional().nullable().or(z.literal('')),
  /** Phase 5: token Turnstile. Hiện tuỳ chọn. */
  turnstileToken: z.string().optional(),
});
export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = createCardSchema
  .omit({ slug: true, turnstileToken: true, facultyId: true })
  .partial();
export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export const checkSlugQuerySchema = z.object({
  slug: z.string().min(1).max(80),
  facultyId: z.string().optional(),
});
