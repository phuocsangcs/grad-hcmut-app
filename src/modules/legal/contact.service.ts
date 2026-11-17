import { desc, eq, lt } from 'drizzle-orm';
import { db } from '@/db';
import { contactMessages, type ContactMessage } from '@/db/schema';
import { getEnv } from '@/lib/env';
import { getEmail } from '@/lib/email';
import { newId } from '@/lib/id';
import { hashIp } from '@/modules/moderation/report.service';
import { CONTACT_TOPICS, type ContactInput } from './contact.validators';

/** Tin nhắn liên hệ tự xoá sau 180 ngày. */
export const CONTACT_TTL_DAYS = 180;

/**
 * Lưu tin nhắn; nếu có ADMIN_EMAIL thì báo qua email (Resend; dev in ra console).
 * Email của chủ dự án chỉ nằm trong biến môi trường, không bao giờ hiện trên web.
 * Ô bẫy `website` có chữ → coi như bot: trả về như thành công nhưng không lưu.
 */
export async function submitContact(input: ContactInput, ip: string): Promise<{ id: string | null }> {
  if (input.website && input.website.trim() !== '') return { id: null };

  const [row] = await db
    .insert(contactMessages)
    .values({
      id: newId(),
      name: input.name || null,
      replyTo: input.replyTo || null,
      topic: input.topic,
      message: input.message,
      cardSlug: input.cardSlug || null,
      ipHash: ip && ip !== 'unknown' ? hashIp(ip) : null,
    })
    .returning();

  const env = getEnv();
  if (env.ADMIN_EMAIL) {
    const lines = [
      `Chủ đề: ${CONTACT_TOPICS[row.topic as keyof typeof CONTACT_TOPICS] ?? row.topic}`,
      `Người gửi: ${row.name ?? '(không tên)'}`,
      `Liên lạc lại: ${row.replyTo ?? '(không để lại)'}`,
      row.cardSlug ? `Thiệp liên quan: ${env.NEXT_PUBLIC_SITE_URL}/${row.cardSlug}` : null,
      '',
      row.message,
      '',
      `Xem tất cả tin nhắn: ${env.NEXT_PUBLIC_SITE_URL}/admin/inbox`,
    ].filter((l) => l !== null);
    try {
      await getEmail().send({ to: env.ADMIN_EMAIL, subject: `[Liên hệ] ${row.name ?? 'Ẩn danh'}: ${row.message.slice(0, 60)}`, text: lines.join('\n') });
    } catch (e) {
      // Tin đã lưu trong DB, email lỗi không làm hỏng việc gửi của người dùng.
      console.error('Gửi email liên hệ thất bại', e);
    }
  }
  return { id: row.id };
}

export async function listContactMessages(limit = 200): Promise<ContactMessage[]> {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(limit);
}

export async function markContactRead(id: string, read: boolean): Promise<void> {
  await db.update(contactMessages).set({ readAt: read ? new Date() : null }).where(eq(contactMessages.id, id));
}

export async function deleteContactMessage(id: string): Promise<void> {
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}

/** Cron: xoá tin nhắn quá hạn lưu. */
export async function cleanupOldContactMessages(now = new Date()): Promise<number> {
  const before = new Date(now.getTime() - CONTACT_TTL_DAYS * 86_400_000);
  const rows = await db.delete(contactMessages).where(lt(contactMessages.createdAt, before)).returning({ id: contactMessages.id });
  return rows.length;
}
