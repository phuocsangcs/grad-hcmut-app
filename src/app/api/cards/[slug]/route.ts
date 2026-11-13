import { getPublicCard } from '@/modules/card';
import { handle, notFound, ok } from '@/lib/http';

export const GET = handle(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const result = await getPublicCard(slug, {
    to: url.searchParams.get('to'),
    modeOverride: url.searchParams.get('mode'),
  });
  if (result.status !== 'ok') throw notFound(`card_${result.status}`);
  return ok(result.card);
});
