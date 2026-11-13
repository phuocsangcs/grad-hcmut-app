import { requireCardByToken } from '@/modules/manage';
import { previewBulk } from '@/modules/invite';
import { handle, ok, readJson } from '@/lib/http';
import { z } from 'zod';

/** Parse text để hiện bảng preview trước khi tạo. Không ghi DB. */
export const POST = handle(async (req: Request, ctx: { params: Promise<{ token: string }> }) => {
  const { token } = await ctx.params;
  await requireCardByToken(token);
  const { text } = await readJson(req, (raw) => z.object({ text: z.string().max(50_000) }).parse(raw));
  return ok(previewBulk(text));
});
