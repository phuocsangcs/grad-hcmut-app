import { recoverSchema, sendRecoveryEmail } from '@/modules/manage';
import { handle, ok, readJson } from '@/lib/http';

/** Luôn trả 200 để không lộ email nào tồn tại. */
export const POST = handle(async (req: Request) => {
  const input = await readJson(req, (raw) => recoverSchema.parse(raw));
  await sendRecoveryEmail(input.email, input.slug);
  return ok({ message: 'Nếu email có thiệp, link quản lý mới đã được gửi.' });
});
