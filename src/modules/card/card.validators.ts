import { z } from 'zod';
import { DEGREE_IDS, INVITE_LEAD_MAX, INVITEE_MAX } from '@/modules/content';
import { MAX_PHOTOS, PENDING_KEY_RE, isPhotoKey } from '@/lib/storage-keys';
import { SLUG_MAX, SLUG_MIN } from './slug';

const phone = z.string().trim().regex(/^(\+84|0)\d{9,10}$/, 'Số điện thoại không hợp lệ');

export const createCardSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  facultyId: z.string().min(1),
  /** Trình độ: cử nhân, kỹ sư, thạc sĩ, tiến sĩ. */
  degree: z.enum(DEGREE_IDS).optional(),
  /** Chương trình OISP (chỉ có nghĩa với cử nhân / kỹ sư). */
  oisp: z.boolean().optional(),
  /** Cho phép sửa giờ lễ; bỏ trống → lấy từ khoa */
  ceremonyAt: z.coerce.date().optional(),
  venue: z.string().trim().min(1).max(80).optional(),
  templateId: z.string().min(1),
  message: z.string().trim().max(500).default(''),
  /** Câu mời ("Thương mời", "Kính mời"…) và người được mời ("Ba Mẹ"). Trống → mặc định. */
  inviteLead: z.string().trim().max(INVITE_LEAD_MAX).optional().nullable(),
  inviteeName: z.string().trim().max(INVITEE_MAX).optional().nullable(),
  meetingPoiId: z.string().optional().nullable(),
  meetingTime: z.string().trim().max(20).optional().nullable(),
  meetingNote: z.string().trim().max(200).optional().nullable(),
  phone: phone.optional().nullable().or(z.literal('')),
  slug: z.string().trim().min(SLUG_MIN).max(SLUG_MAX),
  /** Khoá ảnh đã tải lên R2 (pending/...). Phần tử đầu là ảnh bìa. */
  photos: z.array(z.string().regex(PENDING_KEY_RE, 'Khoá ảnh không hợp lệ')).max(MAX_PHOTOS).optional(),
  /** Giờ đón khách trước lễ và giờ gặp sau lễ. Tuỳ chọn. */
  beforeTime: z.string().trim().max(30).optional().nullable(),
  afterTime: z.string().trim().max(30).optional().nullable(),
  musicId: z.string().optional().nullable(),
  rsvpEnabled: z.boolean().optional(),
  rsvpDeadline: z.coerce.date().optional().nullable(),
  rsvpMaxHeadcount: z.number().int().min(1).max(20).optional(),
  guestbookEnabled: z.boolean().optional(),
  ownerEmail: z.string().trim().email().optional().nullable().or(z.literal('')),
  /** Phase 5: token Turnstile. Hiện tuỳ chọn. */
  turnstileToken: z.string().optional(),
});
export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = createCardSchema
  .omit({ slug: true, turnstileToken: true, facultyId: true, degree: true, oisp: true, photos: true })
  .partial()
  .extend({
    /** Danh sách ảnh mong muốn, theo thứ tự. Khoá cards/ phải là ảnh sẵn có của chính thiệp này (service kiểm tra). */
    photos: z.array(z.string().refine(isPhotoKey, 'Khoá ảnh không hợp lệ')).max(MAX_PHOTOS).optional(),
  });
export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export const checkSlugQuerySchema = z.object({
  slug: z.string().min(1).max(80),
  facultyId: z.string().optional(),
});
