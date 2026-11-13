import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicCard } from '@/modules/card';
import { CardView, CardUnavailable } from './card-view';
import { cardMetadata } from '@/modules/share';
import { vi } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };


export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const r = await getPublicCard(slug, { to: sp.to, skipView: true });
  if (r.status !== 'ok') return { title: vi.card.notFound, robots: { index: false } };
  return cardMetadata(r.card, `/${slug}`);
}

/** UI trần để test luồng. Toàn bộ sẽ thay bằng template thật ở giai đoạn UI. */
export default async function CardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const r = await getPublicCard(slug, { to: sp.to, modeOverride: sp.mode });

  if (r.status === 'not_found') notFound();
  if (r.status !== 'ok') return <CardUnavailable status={r.status} />;
  return <CardView card={r.card} />;
}
