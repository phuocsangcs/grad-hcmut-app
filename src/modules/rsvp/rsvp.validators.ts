import { z } from 'zod';
import { greetingGroupKeys } from '@/modules/content';

const groupKeys = greetingGroupKeys() as [string, ...string[]];

export const submitRsvpSchema = z.object({
  /** Random id do browser sinh, lưu localStorage. Dùng để upsert. */
  clientId: z.string().trim().min(8).max(64),
  guestName: z.string().trim().min(1).max(60),
  headcount: z.coerce.number().int().min(1).max(20).default(1),
  wish: z.string().trim().max(300).optional().nullable(),
  groupKey: z.enum(groupKeys).optional().nullable(),
  /** Phase 3b: code người nhận khi mở từ link riêng */
  inviteCode: z.string().trim().min(1).max(12).optional().nullable(),
});
export type SubmitRsvpInput = z.infer<typeof submitRsvpSchema>;
