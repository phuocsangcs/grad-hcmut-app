import { z } from 'zod';

export const CONTACT_TOPICS = {
  feedback: 'Góp ý, ý tưởng',
  bug: 'Báo lỗi',
  content: 'Gỡ nội dung / thiệp vi phạm',
  other: 'Khác',
} as const;
export type ContactTopic = keyof typeof CONTACT_TOPICS;

export const CONTACT_MESSAGE_MAX = 2000;

export const contactSchema = z.object({
  name: z.string().trim().max(60).optional().or(z.literal('')),
  /** Cách liên lạc lại (email, số Zalo, link Facebook…). Tuỳ chọn. */
  replyTo: z.string().trim().max(120).optional().or(z.literal('')),
  topic: z.enum(Object.keys(CONTACT_TOPICS) as [ContactTopic, ...ContactTopic[]]),
  message: z.string().trim().min(10, 'Viết ít nhất 10 ký tự').max(CONTACT_MESSAGE_MAX),
  cardSlug: z.string().trim().max(80).optional().or(z.literal('')),
  /** Ô bẫy cho bot: người thật không thấy ô này nên luôn để trống. */
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;
