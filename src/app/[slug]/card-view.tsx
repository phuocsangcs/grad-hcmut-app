import Link from 'next/link';
import type { PublicCard, PublicCardResult } from '@/modules/card';
import { formatDateVi, formatTimeVi } from '@/lib/time';
import { vi } from '@/lib/i18n';
import { shareLinks } from '@/modules/share';
import { listPoisByType } from '@/modules/content';
import { RsvpForm } from './rsvp-form';
import { ReportButton } from './report-button';

/** UI trần để test luồng. Toàn bộ sẽ thay bằng template thật ở giai đoạn UI. */
export function CardUnavailable({ status }: { status: Exclude<PublicCardResult['status'], 'ok'> }) {
  const msg = status === 'expired' ? vi.card.expired : status === 'locked' ? vi.card.locked : vi.card.notFound;
  return (
    <main>
      <p>{msg}</p>
      <Link href="/create">{vi.card.createYourOwn}</Link>
    </main>
  );
}

export function CardView({ card: c, inviteCode }: { card: PublicCard; inviteCode?: string }) {
  const at = new Date(c.ceremonyAt);
  const links = shareLinks(c, inviteCode);
  return (
    <main data-template={c.template.id} data-mode={c.mode} data-invite={inviteCode}>
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
      {links.call && <p><a href={links.call}>Gọi cho {c.displayName}</a></p>}
      {c.mode !== 'after' && (
        <RsvpForm slug={c.slug} groupKey={c.groupKey} recipientName={c.recipientName} inviteCode={inviteCode} icsUrl={links.ics} googleCalendarUrl={links.googleCalendar} />
      )}
      {c.mode === 'dayof' && (
        <section>
          <h3>Gần {c.venue}</h3>
          <ul>
            {(['restroom', 'parking', 'water', 'rest', 'photo'] as const).flatMap((t) => listPoisByType(t)).map((poi) => (
              <li key={poi.id}>{poi.name}{poi.note ? ` — ${poi.note}` : ''}</li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3>Hành động</h3>
        <ul>
          <li><a href={links.googleCalendar} target="_blank" rel="noreferrer">Thêm vào Google Calendar</a></li>
          <li><a href={links.ics}>Tải file lịch (.ics)</a></li>
          <li><a href={links.directions} target="_blank" rel="noreferrer">Chỉ đường đến cổng trường</a></li>
          {links.meetingPoi && <li><a href={links.meetingPoi} target="_blank" rel="noreferrer">Điểm hẹn trên Maps</a></li>}
          <li><a href={links.qr}>Mã QR của thiệp</a></li>
        </ul>
      </section>
      {c.mode === 'after' && (
        <section>
          <h3>{vi.card.thankYou}</h3>
          <p>{vi.card.willDelete(formatDateVi(new Date(c.expiresAt)))}</p>
        </section>
      )}
      <section>
        <h3>Khám phá</h3>
        <ul>
          <li><Link href="/guide/map">Bản đồ trong trường</Link></li>
          <li><Link href="/eat">Ăn gì sau lễ</Link></li>
          <li><Link href="/guide">Cẩm nang lễ tốt nghiệp</Link></li>
        </ul>
      </section>
      <footer>
        <p><Link href="/create">{vi.card.createYourOwn}</Link></p>
        <ReportButton slug={c.slug} />
      </footer>
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
