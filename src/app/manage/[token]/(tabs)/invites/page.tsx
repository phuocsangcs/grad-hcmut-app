import { INVITES_PER_CARD_MAX, inviteStats, listInvites } from '@/modules/invite';
import { listRsvps, rsvpSummary } from '@/modules/rsvp';
import { getFaculty, greetingsFile, listInviteLeads, listTemplates } from '@/modules/content';
import { Button, Icon } from '@/ui';
import { loadManagedCard } from '../load-card';
import { WishToggle } from '../wish-toggle';
import { AddGuest } from './add-guest';
import { GuestList } from './guest-list';
import type { GuestDefaults, GuestRow } from './types';
import s from './invites.module.css';

type Props = { params: Promise<{ token: string }> };

export const metadata = { title: 'Khách mời' };

/**
 * Tab Khách mời: một bộ số liệu chung, thêm/quản lý khách (link riêng),
 * và nhật ký mọi xác nhận + lời chúc (cả link riêng lẫn link chung).
 */
export default async function GuestsTab({ params }: Props) {
  const { token } = await params;
  const card = await loadManagedCard(token);
  if (!card) return null; // layout đã hiện thông báo không tìm thấy

  const [list, rsvps, summary] = await Promise.all([listInvites(card.slug, card.id), listRsvps(card.id), rsvpSummary(card.id)]);
  const stats = inviteStats(list);
  const guests: GuestRow[] = list.map((i) => ({
    id: i.id,
    code: i.code,
    name: i.recipientName,
    greeting: i.greeting,
    message: i.message,
    templateId: i.templateId,
    url: i.url,
    views: i.viewCount,
    rsvp: i.rsvp ? { headcount: i.rsvp.headcount, wish: i.rsvp.wish } : null,
  }));
  const defaults: GuestDefaults = {
    slug: card.slug,
    lead: card.inviteLead || greetingsFile.defaultInviteLead,
    message: card.message || getFaculty(card.facultyId)?.invitation || greetingsFile.defaultMessage,
    leads: listInviteLeads(),
    templates: listTemplates().map((t) => ({ id: t.id, name: t.name })),
  };
  const max = INVITES_PER_CARD_MAX;
  const full = stats.total >= max;
  const inviteName = new Map(list.map((i) => [i.id, i.recipientName]));

  // Một bộ số liệu duy nhất cho cả thiệp: lượt mở + xác nhận tính cả link chung.
  const tiles = [
    { label: 'Lượt mở thiệp', value: card.viewCount, tone: s.toneSky, hint: 'Cả link chung và link riêng' },
    { label: 'Khách có link riêng', value: stats.total, tone: s.toneBlue, hint: `${stats.notOpened} chưa mở` },
    { label: 'Đã mở link riêng', value: stats.opened, tone: s.toneSky, hint: `${stats.pending} chưa phản hồi` },
    { label: 'Xác nhận tham dự', value: summary.responses, tone: s.toneGreen, hint: `${summary.responses - stats.confirmed} qua link chung` },
    { label: 'Tổng số người', value: summary.guests, tone: s.toneBlue, hint: 'Theo số người khách báo' },
    { label: 'Lời chúc', value: summary.wishes, tone: s.toneSun, hint: card.guestbookEnabled ? 'Đang hiện công khai' : 'Chỉ bạn thấy' },
  ];

  return (
    <>
      <div className={s.toolbar}>
        <p className={s.muted}>Mỗi khách một link riêng: mở ra thấy đúng tên, câu mời và lời nhắn của mình.</p>
        <div className={s.headActions}>
          <Button href={`/manage/${token}/print`} target="_blank" variant="secondary" leading={<Icon name="print" size={16} />}>
            In QR hàng loạt
          </Button>
          <Button href={`/api/manage/${token}/invites/export`} variant="secondary" download leading={<Icon name="download" size={16} />}>
            Tải báo cáo
          </Button>
        </div>
      </div>

      <dl className={s.stats}>
        {tiles.map((t) => (
          <div key={t.label} className={s.stat}>
            <dt>{t.label}</dt>
            <dd className={t.tone}>{t.value}</dd>
            <dd className={s.statHint}>{t.hint}</dd>
          </div>
        ))}
      </dl>

      <div className={s.quota}>
        <Icon name="users" size={18} />
        <b>
          {stats.total} / {max} khách
        </b>
        <span className={s.bar} role="progressbar" aria-label="Số khách đã thêm" aria-valuemin={0} aria-valuemax={max} aria-valuenow={stats.total}>
          <span style={{ width: `${Math.min(100, (stats.total / max) * 100)}%` }} />
        </span>
        <span className={s.muted}>{full ? 'Đã đủ số khách tối đa.' : `Còn ${max - stats.total} chỗ`}</span>
      </div>

      <div className={s.layout}>
        <AddGuest token={token} defaults={defaults} full={full} />
        <GuestList token={token} guests={guests} defaults={defaults} />
      </div>

      <section className={s.panel} aria-labelledby="rsvp-log-title">
        <div className={s.listHead}>
          <div>
            <h2 id="rsvp-log-title" className={s.panelTitle}>
              Tất cả xác nhận & lời chúc
            </h2>
            <p className={s.muted}>Gồm cả khách bấm xác nhận từ link chung (không có trong danh sách khách ở trên).</p>
          </div>
        </div>
        {rsvps.length === 0 ? (
          <div className={s.empty}>
            <p>
              <strong>Chưa có ai xác nhận.</strong>
            </p>
            <p>Gửi link cho mọi người. Ai bấm “sẽ đến” sẽ hiện ở đây.</p>
          </div>
        ) : (
          <ul className={s.rsvpLog}>
            {rsvps.map((r) => (
              <li key={r.id}>
                <div>
                  <strong>{r.guestName}</strong>
                  <span className={r.inviteId ? s.badgeInfo : s.badgeMuted}>{r.inviteId ? `Link riêng · ${inviteName.get(r.inviteId) ?? 'đã xoá'}` : 'Link chung'}</span>
                  {r.wish ? <p className={s.logWish}>“{r.wish}”</p> : null}
                  {r.wish && card.guestbookEnabled ? <WishToggle token={token} id={r.id} hidden={r.hidden} /> : null}
                </div>
                <span className={s.logCount}>{r.headcount} người</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
