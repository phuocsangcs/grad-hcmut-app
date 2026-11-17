import { contactSchema, submitContact } from '@/modules/legal';
import { badRequest, handle, ok, readJson, tooMany } from '@/lib/http';
import { clientIp, limiter, RULES, verifyTurnstile } from '@/modules/moderation';

/** Form Liên hệ: lưu tin nhắn cho chủ dự án đọc ở /admin/inbox. */
export const POST = handle(async (req: Request) => {
  const ip = clientIp(req);
  if (!limiter.hit(`contact:${ip}`, RULES.contact).allowed) throw tooMany();
  const input = await readJson(req, (raw) => contactSchema.parse(raw));
  if (!(await verifyTurnstile(input.turnstileToken, ip))) throw badRequest('turnstile_failed');
  await submitContact(input, ip);
  return ok({ message: 'Đã gửi. Cảm ơn bạn!' }, { status: 201 });
});
