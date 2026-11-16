import { z } from 'zod';
import { INVITE_LEAD_MAX, INVITEE_MAX } from '@/modules/content';

export const inviteRowSchema = z.object({
  recipientName: z.string().trim().min(1).max(INVITEE_MAX),
  /** Câu mời riêng ("Kính mời"…); trống → câu mời của thiệp. */
  greeting: z.string().trim().max(INVITE_LEAD_MAX).nullable().optional(),
  templateId: z.string().nullable().optional(),
});

/** Tạo hàng loạt: hoặc gửi text thô, hoặc gửi rows đã parse (sau khi user sửa ở preview). */
export const bulkCreateSchema = z.union([
  z.object({ text: z.string().min(1).max(50_000) }),
  z.object({ rows: z.array(inviteRowSchema).min(1).max(200) }),
]);
export type BulkCreateInput = z.infer<typeof bulkCreateSchema>;

export const updateInviteSchema = inviteRowSchema.partial();
export type UpdateInviteInput = z.infer<typeof updateInviteSchema>;
