import { createHash } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { reports, type Report } from '@/db/schema';
import { getEnv } from '@/lib/env';
import { getEmail } from '@/lib/email';
import { newId } from '@/lib/id';
import { notFound } from '@/lib/http';
import { cardRepo } from '@/modules/card/card.repo';
import { normalizeSlug } from '@/modules/card/slug';
import { REPORT_REASON_LABELS, type SubmitReportInput } from './report.validators';

/** Tự khoá khi đủ số báo cáo từ IP khác nhau; admin xem email rồi quyết mở lại. */
export const AUTO_LOCK_THRESHOLD = 3;

export function hashIp(ip: string): string {
  return createHash('sha256').update(`ip:${ip}`).digest('hex').slice(0, 32);
}

export async function submitReport(slug: string, input: SubmitReportInput, ip: string): Promise<{ reportId: string; autoLocked: boolean }> {
  const card = await cardRepo.findBySlug(normalizeSlug(slug));
  if (!card) throw notFound('card_not_found');

  const [row] = await db
    .insert(reports)
    .values({ id: newId(), cardId: card.id, reason: input.reason, detail: input.detail || null, reporterIpHash: hashIp(ip) })
    .returning();

  const [{ distinct }] = await db
    .select({ distinct: sql<number>`count(distinct ${reports.reporterIpHash})::int` })
    .from(reports)
    .where(eq(reports.cardId, card.id));

  let autoLocked = false;
  if (!card.locked && distinct >= AUTO_LOCK_THRESHOLD) {
    await cardRepo.setLocked(card.id, true);
    autoLocked = true;
  }

  await notifyAdmin(row, { slug: card.slug, displayName: card.displayName, distinct, autoLocked });
  return { reportId: row.id, autoLocked };
}

async function notifyAdmin(r: Report, ctx: { slug: string; displayName: string; distinct: number; autoLocked: boolean }) {
  const env = getEnv();
  if (!env.ADMIN_EMAIL) return;
  const base = env.NEXT_PUBLIC_SITE_URL;
  await getEmail()
    .send({
      to: env.ADMIN_EMAIL,
      subject: `[Báo cáo] ${ctx.slug} – ${REPORT_REASON_LABELS[r.reason as keyof typeof REPORT_REASON_LABELS] ?? r.reason}${ctx.autoLocked ? ' – ĐÃ TỰ KHOÁ' : ''}`,
      text: [
        `Thiệp: ${base}/${ctx.slug} (${ctx.displayName})`,
        `Lý do: ${r.reason}`,
        `Chi tiết: ${r.detail ?? '(không)'}`,
        `Số IP khác nhau đã báo cáo: ${ctx.distinct}`,
        ctx.autoLocked ? 'Thiệp đã tự khoá. Mở lại: update cards set locked=false where slug=...' : `Khoá: update cards set locked=true where slug='${ctx.slug}';`,
      ].join('\n'),
    })
    .catch((e) => console.error('Không gửi được email báo cáo', e));
}

export const listReports = (cardId: string) => db.query.reports.findMany({ where: eq(reports.cardId, cardId) });

/** Dọn thiệp hết hạn (F5). Gọi từ cron hoặc chạy tay. RSVP/invite/report xoá theo cascade. */
export async function cleanupExpiredCards(now = new Date()): Promise<number> {
  return cardRepo.deleteExpired(now);
}
