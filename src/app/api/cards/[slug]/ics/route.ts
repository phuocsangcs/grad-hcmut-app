import { getPublicCard } from '@/modules/card';
import { cardIcs } from '@/modules/share';
import { handle, notFound } from '@/lib/http';

export const GET = handle(async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const r = await getPublicCard(slug, { skipView: true });
  if (r.status !== 'ok') throw notFound(`card_${r.status}`);
  return new Response(cardIcs(r.card), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="le-tot-nghiep-${r.card.slug}.ics"`,
      'Cache-Control': 'public, max-age=300',
    },
  });
});
