import { cleanupExpiredCards } from '@/modules/moderation';
import { getEnv } from '@/lib/env';
import { handle, ok, HttpError } from '@/lib/http';

/**
 * Vercel Cron gọi hàng ngày (xem vercel.json). Bảo vệ bằng CRON_SECRET.
 * Chạy tay: curl -H "Authorization: Bearer $CRON_SECRET" https://.../api/cron/cleanup
 */
export const GET = handle(async (req: Request) => {
  const secret = getEnv().CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) throw new HttpError(401, 'unauthorized');
  const deleted = await cleanupExpiredCards();
  return ok({ deleted });
});
