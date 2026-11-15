import { requireCardByToken } from '@/modules/manage';
import { z } from 'zod';
import { removeRsvp, setRsvpHidden } from '@/modules/rsvp';
import { handle, ok, readJson } from '@/lib/http';

type Ctx = { params: Promise<{ token: string; id: string }> };

/** Chủ thiệp ẩn/hiện một lời chúc khỏi lưu bút công khai. */
export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const { token, id } = await ctx.params;
  const card = await requireCardByToken(token);
  const { hidden } = await readJson(req, (raw) => z.object({ hidden: z.boolean() }).parse(raw));
  await setRsvpHidden(card.id, id, hidden);
  return ok({ hidden });
});

/** Chủ thiệp xoá một RSVP spam. */
export const DELETE = handle(async (_req: Request, ctx: { params: Promise<{ token: string; id: string }> }) => {
  const { token, id } = await ctx.params;
  const card = await requireCardByToken(token);
  await removeRsvp(card.id, id);
  return ok({ deleted: true });
});
