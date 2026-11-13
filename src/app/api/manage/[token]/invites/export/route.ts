import { requireCardByToken } from '@/modules/manage';
import { exportInvitesCsv } from '@/modules/invite';
import { handle } from '@/lib/http';

export const GET = handle(async (_req: Request, ctx: { params: Promise<{ token: string }> }) => {
  const { token } = await ctx.params;
  const card = await requireCardByToken(token);
  const csv = await exportInvitesCsv(card.slug, card.id);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="nguoi-nhan-${card.slug}.csv"`,
    },
  });
});
