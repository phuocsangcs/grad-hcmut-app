import type { Metadata } from 'next';
import { getPublicCardByInvite } from '@/modules/invite';
import { formatDateVi, formatTimeVi } from '@/lib/time';
import { vi } from '@/lib/i18n';
import { CardView, CardUnavailable } from '../card-view';

type Props = { params: Promise<{ slug: string; code: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, code } = await params;
  const r = await getPublicCardByInvite(slug, code, { skipView: true });
  if (r.status !== 'ok') return { title: vi.card.notFound };
  const c = r.card;
  return {
    title: `${c.displayName} gửi thiệp tốt nghiệp cho ${c.recipientName}`,
    description: `${formatDateVi(new Date(c.ceremonyAt))} · ${formatTimeVi(new Date(c.ceremonyAt))} · ${c.venue}`,
    openGraph: { images: [c.template.ogImage] },
  };
}

/** Thiệp cá nhân hoá cho một người nhận. */
export default async function InviteCardPage({ params, searchParams }: Props) {
  const { slug, code } = await params;
  const sp = await searchParams;
  const r = await getPublicCardByInvite(slug, code, { modeOverride: sp.mode });
  if (r.status !== 'ok') return <CardUnavailable status={r.status} />;
  return <CardView card={r.card} inviteCode={code} />;
}
