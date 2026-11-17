import { cleanupExpiredCards } from '@/modules/moderation';
import { cleanupOldContactMessages, cleanupOrphanConsents } from '@/modules/legal';
import { getEnv } from '@/lib/env';
import { handle, ok, HttpError } from '@/lib/http';

/**
 * Vercel Cron gọi hàng ngày (xem vercel.json). Bảo vệ bằng CRON_SECRET.
 * Chạy tay: curl -H "Authorization: Bearer $CRON_SECRET" https://.../api/cron/cleanup
 */
export const GET = handle(async (req: Request) => {
  const env = getEnv();
  const secret = env.CRON_SECRET;
  // Production bắt buộc có CRON_SECRET; Vercel Cron tự gửi header Authorization: Bearer <CRON_SECRET>.
  if (secret ? req.headers.get('authorization') !== `Bearer ${secret}` : env.NODE_ENV === 'production') {
    throw new HttpError(401, 'unauthorized');
  }
  const deleted = await cleanupExpiredCards();
  const contactMessages = await cleanupOldContactMessages();
  const consentLogs = await cleanupOrphanConsents();
  return ok({ deleted, contactMessages, consentLogs });
});
