import { listCardRsvps } from '@/modules/manage';
import { handle, ok } from '@/lib/http';

export const GET = handle(async (_req: Request, ctx: { params: Promise<{ token: string }> }) => {
  const { token } = await ctx.params;
  return ok(await listCardRsvps(token));
});
