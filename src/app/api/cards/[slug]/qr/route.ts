import { getPublicCard } from '@/modules/card';
import { isInviteCode } from '@/modules/invite';
import { renderQr } from '@/modules/share';
import { getEnv } from '@/lib/env';
import { handle, notFound } from '@/lib/http';

/** QR trỏ tới thiệp. ?code= → link riêng người nhận. ?format=svg|png, ?size= */
export const GET = handle(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const r = await getPublicCard(slug, { skipView: true });
  if (r.status !== 'ok') throw notFound(`card_${r.status}`);
  const q = new URL(req.url).searchParams;
  const code = q.get('code');
  const format = q.get('format') === 'svg' ? 'svg' : 'png';
  const size = Math.min(Math.max(Number(q.get('size')) || 512, 128), 1024);
  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  const url = `${base}/${r.card.slug}${code && isInviteCode(code) ? `/${code}` : ''}`;
  const { body, contentType } = await renderQr(url, format, size);
  return new Response(body as BodyInit, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' },
  });
});
