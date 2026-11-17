import { and, desc, eq, isNull, lt } from 'drizzle-orm';
import { db } from '@/db';
import { consentLogs, type ConsentLog } from '@/db/schema';
import { newId } from '@/lib/id';
import { hashIp } from '@/modules/moderation/report.service';

/** Giữ log đã mất liên kết thiệp (thiệp đã xoá) trong 12 tháng rồi xoá. */
export const ORPHAN_CONSENT_TTL_DAYS = 365;

export type ConsentMeta = { ip: string; userAgent: string | null };

/** Ghi lại việc người tạo thiệp đồng ý điều khoản (gọi ngay sau khi tạo thiệp). */
export async function recordConsent(cardId: string, termsVersion: string, meta: ConsentMeta): Promise<ConsentLog> {
  const [row] = await db
    .insert(consentLogs)
    .values({
      id: newId(),
      cardId,
      termsVersion,
      ipHash: meta.ip && meta.ip !== 'unknown' ? hashIp(meta.ip) : null,
      userAgent: meta.userAgent ? meta.userAgent.slice(0, 200) : null,
    })
    .returning();
  return row;
}

/** Lần đồng ý gần nhất của một thiệp; null với thiệp tạo trước khi có tính năng này. */
export async function getConsentForCard(cardId: string): Promise<ConsentLog | null> {
  const [row] = await db.select().from(consentLogs).where(eq(consentLogs.cardId, cardId)).orderBy(desc(consentLogs.acceptedAt)).limit(1);
  return row ?? null;
}

/** Cron: xoá log của thiệp đã xoá, quá hạn lưu. */
export async function cleanupOrphanConsents(now = new Date()): Promise<number> {
  const before = new Date(now.getTime() - ORPHAN_CONSENT_TTL_DAYS * 86_400_000);
  const rows = await db
    .delete(consentLogs)
    .where(and(isNull(consentLogs.cardId), lt(consentLogs.acceptedAt, before)))
    .returning({ id: consentLogs.id });
  return rows.length;
}
