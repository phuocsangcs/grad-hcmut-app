import { requireCardByToken } from '@/modules/manage';
import { removeRsvp } from '@/modules/rsvp';
import { handle, ok } from '@/lib/http';

/** Chủ thiệp xoá một RSVP spam. */
export const DELETE = handle(async (_req: Request, ctx: { params: Promise<{ token: string; id: string }> }) => {
  const { token, id } = await ctx.params;
  const card = await requireCardByToken(token);
  await removeRsvp(card.id, id);
  return ok({ deleted: true });
});
