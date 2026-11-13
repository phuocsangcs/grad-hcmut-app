import { getMyRsvp, submitRsvp, submitRsvpSchema } from '@/modules/rsvp';
import { badRequest, handle, ok, readJson } from '@/lib/http';

type Ctx = { params: Promise<{ slug: string }> };

/** Khách xác nhận tham dự. */
export const POST = handle(async (req: Request, ctx: Ctx) => {
  const { slug } = await ctx.params;
  const input = await readJson(req, (raw) => submitRsvpSchema.parse(raw));
  const r = await submitRsvp(slug, input);
  return ok({ id: r.id, guestName: r.guestName, headcount: r.headcount, wish: r.wish, updatedAt: r.updatedAt }, { status: 201 });
});

/** Khách mở lại: ?clientId=... → đã RSVP chưa. */
export const GET = handle(async (req: Request, ctx: Ctx) => {
  const { slug } = await ctx.params;
  const clientId = new URL(req.url).searchParams.get('clientId');
  if (!clientId) throw badRequest('client_id_required');
  const r = await getMyRsvp(slug, clientId);
  return ok(r ? { confirmed: true, guestName: r.guestName, headcount: r.headcount, wish: r.wish } : { confirmed: false });
});
