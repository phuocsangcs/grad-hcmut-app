import { recoverSchema, sendRecoveryEmail } from '@/modules/manage';
import { handle, ok, readJson, tooMany } from '@/lib/http';
import { clientIp, limiter, RULES } from '@/modules/moderation';

/** Luôn trả 200 để không lộ email nào tồn tại. */
export const POST = handle(async (req: Request) => {
  if (!limiter.hit(`recover:${clientIp(req)}`, RULES.recover).allowed) throw tooMany();
  const input = await readJson(req, (raw) => recoverSchema.parse(raw));
  await sendRecoveryEmail(input.email, input.slug);
  return ok({ message: 'Nếu email có thiệp, link quản lý mới đã được gửi.' });
});
