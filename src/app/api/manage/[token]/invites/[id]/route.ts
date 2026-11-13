import { requireCardByToken } from '@/modules/manage';
import { removeInvite, updateInvite, updateInviteSchema } from '@/modules/invite';
import { handle, ok, readJson } from '@/lib/http';

type Ctx = { params: Promise<{ token: string; id: string }> };

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const { token, id } = await ctx.params;
  const card = await requireCardByToken(token);
  const patch = await readJson(req, (raw) => updateInviteSchema.parse(raw));
  return ok(await updateInvite(card.id, id, patch));
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const { token, id } = await ctx.params;
  const card = await requireCardByToken(token);
  await removeInvite(card.id, id);
  return ok({ deleted: true });
});
