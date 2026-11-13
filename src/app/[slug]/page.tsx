import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicCard, type PublicCard } from '@/modules/card';
import { formatDateVi, formatTimeVi } from '@/lib/time';
import { vi } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const r = await getPublicCard(slug, { to: sp.to, skipView: true });
  if (r.status !== 'ok') return { title: vi.card.notFound };
  const c = r.card;
  return {
    title: `${c.displayName} mời bạn dự lễ tốt nghiệp`,
    description: `${formatDateVi(new Date(c.ceremonyAt))} · ${formatTimeVi(new Date(c.ceremonyAt))} · ${c.venue}`,
    openGraph: { images: [c.template.ogImage] },
  };
}

/** UI trần để test luồng. Toàn bộ sẽ thay bằng template thật ở giai đoạn UI. */
export default async function CardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const r = await getPublicCard(slug, { to: sp.to, modeOverride: sp.mode });

  if (r.status !== 'ok') {
    const msg = r.status === 'expired' ? vi.card.expired : r.status === 'locked' ? vi.card.locked : vi.card.notFound;
    return (
      <main>
        <p>{msg}</p>
        <Link href="/create">{vi.card.createYourOwn}</Link>
      </main>
    );
  }
  return <CardView card={r.card} />;
}

function CardView({ card: c }: { card: PublicCard }) {
  const at = new Date(c.ceremonyAt);
  return (
    <main data-template={c.template.id} data-mode={c.mode}>
      <p><small>mode: {c.mode} · template: {c.template.name}</small></p>
      {c.mode === 'dayof' && (
        <p><strong>{vi.card.todayBanner}</strong> Lễ {c.faculty.shortName} · {formatTimeVi(at)} · {c.venue} — <Countdown cd={c.countdown} /></p>
      )}
      <h1>{c.greeting}</h1>
      <p>{c.message}</p>
      <section>
        <h2>{c.displayName} · {c.faculty.name}</h2>
        <p>{formatDateVi(at)} · {formatTimeVi(at)} · {c.venue}</p>
        {c.mode === 'before' && <p><Countdown cd={c.countdown} /></p>}
      </section>
      {c.meeting && (
        <section>
          <h3>Điểm hẹn</h3>
          <p>{c.meeting.poi.name}{c.meeting.time ? ` · ${c.meeting.time}` : ''}</p>
          {c.meeting.note && <p>{c.meeting.note}</p>}
        </section>
      )}
      {c.phone && <p><a href={`tel:${c.phone}`}>Gọi cho {c.displayName}</a></p>}
      {c.mode === 'after' && (
        <section>
          <h3>{vi.card.thankYou}</h3>
          <p>{vi.card.willDelete(formatDateVi(new Date(c.expiresAt)))}</p>
        </section>
      )}
      <footer><Link href="/create">{vi.card.createYourOwn}</Link></footer>
    </main>
  );
}

function Countdown({ cd }: { cd: PublicCard['countdown'] }) {
  switch (cd.kind) {
    case 'days': return <>còn {cd.days} ngày</>;
    case 'hours': return <>{vi.card.hoursLeft(cd.hours)}</>;
    case 'minutes': return <>{vi.card.minutesLeft(cd.minutes)}</>;
    case 'started': return <>{vi.card.started}</>;
  }
}
