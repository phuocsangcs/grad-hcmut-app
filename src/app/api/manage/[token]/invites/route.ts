import { requireCardByToken } from '@/modules/manage';
import { bulkCreateInvites, bulkCreateSchema, listInvites } from '@/modules/invite';
import { handle, ok, readJson } from '@/lib/http';

type Ctx = { params: Promise<{ token: string }> };

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  const { token } = await ctx.params;
  const card = await requireCardByToken(token);
  return ok(await listInvites(card.slug, card.id));
});

/** Tạo hàng loạt: body { text } hoặc { rows }. Có lỗi dòng → 400 kèm danh sách lỗi, không tạo gì. */
export const POST = handle(async (req: Request, ctx: Ctx) => {
  const { token } = await ctx.params;
  const card = await requireCardByToken(token);
  const input = await readJson(req, (raw) => bulkCreateSchema.parse(raw));
  const r = await bulkCreateInvites(card.id, input);
  if (r.errors.length) return ok({ created: [], errors: r.errors }, { status: 400 });
  return ok({ created: r.created, errors: [] }, { status: 201 });
});
