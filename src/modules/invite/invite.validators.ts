import { z } from 'zod';
import { greetingGroupKeys } from '@/modules/content';

const groupKeys = greetingGroupKeys() as [string, ...string[]];

export const inviteRowSchema = z.object({
  recipientName: z.string().trim().min(1).max(60),
  groupKey: z.enum(groupKeys).nullable().optional(),
  greeting: z.string().trim().max(200).nullable().optional(),
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
