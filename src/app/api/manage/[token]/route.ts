import { deleteByToken, getOverview, updateByToken } from '@/modules/manage';
import { updateCardSchema } from '@/modules/card';
import { handle, ok, readJson } from '@/lib/http';

type Ctx = { params: Promise<{ token: string }> };

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  const { token } = await ctx.params;
  const o = await getOverview(token);
  const { manageTokenHash: _h, ...card } = o.card;
  void _h;
  return ok({ card, preview: o.preview, summary: o.summary, urls: o.urls });
});

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const { token } = await ctx.params;
  const patch = await readJson(req, (raw) => updateCardSchema.parse(raw));
  const card = await updateByToken(token, patch);
  const { manageTokenHash: _h, ...safe } = card;
  void _h;
  return ok(safe);
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const { token } = await ctx.params;
  await deleteByToken(token);
  return ok({ deleted: true });
});
