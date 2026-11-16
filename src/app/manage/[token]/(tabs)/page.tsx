import Link from 'next/link';
import { getOverview, listCardRsvps } from '@/modules/manage';
import { HttpError } from '@/lib/http';
import { formatDateVi, formatTimeVi } from '@/lib/time';
import { toVnLocalInput } from '@/lib/time';
import { publicUrl } from '@/lib/storage';
import { greetingsFile, listInviteLeads, listMeetingPois, listMusic, listTemplates } from '@/modules/content';
import { InvitationCard, type TemplateLinks } from '@/templates';
import { Button, Chip, CopyButton, Icon, Page, PageHeading, PhoneFrame, ShareButton, Surface } from '@/ui';
import { isStorageEnabled } from '@/lib/storage';
import { CardActions } from './card-actions';
import { WishToggle } from './wish-toggle';
import s from './manage.module.css';

type Props = { params: Promise<{ token: string }> };

export const metadata = { title: 'Quản lý thiệp', robots: { index: false } };

/** Trang quản lý của chủ thiệp: số liệu, lời chúc, xem trước, sửa nhanh. */
export default async function ManagePage({ params }: Props) {
  const { token } = await params;
  let data;
  try {
    data = await getOverview(token);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return (
        <Page width="narrow">
          <PageHeading title="Không tìm thấy thiệp" lead="Link quản lý không đúng, hoặc thiệp đã bị xoá / hết hạn." />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button href="/templates">Tạo thiệp mới</Button>
            <Button href="/about#recover" variant="ghost">Lấy lại link bằng email</Button>
          </div>
        </Page>
      );
    }
    throw e;
  }
  const rsvps = await listCardRsvps(token);
  const { card, summary, urls, preview } = data;
  const previewLinks: TemplateLinks = { card: urls.card, qr: '#', googleCalendar: '#', directions: '#', meetingPoi: preview.meeting ? '#' : null, call: preview.phone ? '#' : null, messenger: '#' };

  return (
    <Page>
      <header className={s.head}>
        <div>
          <h1>Thiệp của {card.displayName}</h1>
          <div className={s.meta}>
            <Chip tone="primary" dot>{formatDateVi(card.ceremonyAt)} · {formatTimeVi(card.ceremonyAt)}</Chip>
            <Chip>{card.venue}</Chip>
            <Chip tone="outline">/{card.slug}</Chip>
          </div>
        </div>
        <div className={s.headActions}>
          <CopyButton text={urls.card} label="Chép link thiệp" />
          <ShareButton url={urls.card} label="Gửi" />
          <Button href={urls.card} variant="ghost" target="_blank" rel="noreferrer" trailing={<Icon name="external" size={16} />}>Mở thiệp</Button>
        </div>
      </header>

      <div className={s.layout}>
        <div className={s.col}>
          <div className={s.stats}>
            <div className={`${s.stat} ${s.statMain}`}><b>{summary.guests}</b><span>người sẽ đến</span></div>
            <div className={s.stat}><b>{summary.responses}</b><span>phản hồi</span></div>
            <div className={s.stat}><b>{summary.wishes}</b><span>lời chúc</span></div>
            <div className={s.stat}><b>{card.viewCount}</b><span>lượt mở thiệp</span></div>
          </div>

          <section>
            <h2 className={s.h2}>
              Ai sẽ đến & lời chúc
              <Link href={`/manage/${token}/invites`} style={{ fontSize: 'var(--text-sm)', color: 'var(--bk-600)' }}>Gửi riêng từng người →</Link>
            </h2>
            {rsvps.length === 0 ? (
              <div className={s.empty}>
                <p><strong>Chưa có ai xác nhận.</strong></p>
                <p>Gửi link cho Ba Mẹ, Ông Bà, bạn bè. Ai bấm “sẽ đến” sẽ hiện ở đây.</p>
              </div>
            ) : (
              <ul className={s.rsvps}>
                {rsvps.map((r) => (
                  <li key={r.id} className={s.rsvp}>
                    <span className={s.avatar} aria-hidden="true">{r.guestName.trim().charAt(0).toUpperCase()}</span>
                    <div>
                      <strong>{r.guestName}</strong>
                      {r.wish ? <p>“{r.wish}”</p> : null}
                      {r.wish && card.guestbookEnabled ? <WishToggle token={token} id={r.id} hidden={r.hidden} /> : null}
                    </div>
                    <span className={s.count}>{r.headcount} người</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <CardActions
            token={token}
            templates={listTemplates().map((t) => ({ id: t.id, name: t.name, description: t.description }))}
            pois={listMeetingPois().map((p) => ({ id: p.id, name: p.name }))}
            current={{
              templateId: card.templateId,
              message: card.message,
              inviteLead: card.inviteLead ?? greetingsFile.defaultInviteLead,
              inviteeName: card.inviteeName ?? '',
              displayName: card.displayName,
              meetingPoiId: card.meetingPoiId ?? '',
              meetingTime: card.meetingTime ?? '',
              phone: card.phone ?? '',
              uploads: (card.photos ?? []).map((key) => ({ key, url: publicUrl(key) })),
              beforeTime: card.beforeTime ?? '',
              afterTime: card.afterTime ?? '',
              musicId: card.musicId ?? '',
              rsvpEnabled: card.rsvpEnabled,
              rsvpDeadline: card.rsvpDeadline ? toVnLocalInput(card.rsvpDeadline) : '',
              rsvpMaxHeadcount: card.rsvpMaxHeadcount,
              guestbookEnabled: card.guestbookEnabled,
            }}
            inviteLeads={listInviteLeads()}
            defaultInvitee={greetingsFile.defaultInvitee}
            music={listMusic().map((m) => ({ id: m.id, title: m.artist ? `${m.title} · ${m.artist}` : m.title }))}
            photosEnabled={isStorageEnabled()}
          />
        </div>

        <aside className={s.aside} aria-label="Thiệp hiện tại">
          <PhoneFrame scale={0.88}>
            <InvitationCard card={preview} links={previewLinks} preview />
          </PhoneFrame>
          <Button href={`/api/cards/${card.slug}/qr?size=1024`} variant="secondary" size="sm" download leading={<Icon name="qr" size={16} />}>Tải mã QR</Button>
          <Surface tone="tint" pad="sm">
            <p className={s.note}><Icon name="lock" size={16} /> Giữ link trang này riêng tư. Ai có link đều sửa hoặc xoá được thiệp.</p>
          </Surface>
        </aside>
      </div>
    </Page>
  );
}
