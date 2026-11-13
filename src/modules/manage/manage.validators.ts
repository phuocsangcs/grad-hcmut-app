import { z } from 'zod';

export const recoverSchema = z.object({
  email: z.string().trim().email(),
  /** Tuỳ chọn: nếu có slug thì chỉ gửi thiệp đó */
  slug: z.string().trim().optional(),
});
export type RecoverInput = z.infer<typeof recoverSchema>;
