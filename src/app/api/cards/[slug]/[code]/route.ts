import { getPublicCardByInvite } from '@/modules/invite';
import { handle, notFound, ok } from '@/lib/http';

export const GET = handle(async (req: Request, ctx: { params: Promise<{ slug: string; code: string }> }) => {
  const { slug, code } = await ctx.params;
  const result = await getPublicCardByInvite(slug, code, { modeOverride: new URL(req.url).searchParams.get('mode') });
  if (result.status !== 'ok') throw notFound(`card_${result.status}`);
  return ok(result.card);
});
