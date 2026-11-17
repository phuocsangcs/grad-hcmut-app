import { loadWishes, toPublicCard } from '@/modules/card';
import { toVnLocalInput } from '@/lib/time';
import { isStorageEnabled, publicUrl } from '@/lib/storage';
import { getEnv } from '@/lib/env';
import { greetingsFile, listInviteLeads, listMeetingPois, listMusic, listTemplates } from '@/modules/content';
import { getConsentForCard, TERMS_VERSION } from '@/modules/legal';
import { InvitationCard, type TemplateLinks } from '@/templates';
import Link from 'next/link';
import { Icon, PhoneFrame, Surface } from '@/ui';
import { CardActions } from './card-actions';
import { loadManagedCard } from './load-card';
import s from './manage.module.css';

type Props = { params: Promise<{ token: string }> };

export const metadata = { title: 'Quản lý thiệp' };

/** Tab Thiệp: sửa nội dung thiệp (trái) và xem trước thiệp hiện tại (phải). */
export default async function ManageCardTab({ params }: Props) {
  const { token } = await params;
  const card = await loadManagedCard(token);
  if (!card) return null; // layout đã hiện thông báo không tìm thấy

  const preview = toPublicCard(card, { skipView: true }, new Date(), await loadWishes(card));
  const consent = await getConsentForCard(card.id);
  const fmtVn = (d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' }).format(d);
  const previewLinks: TemplateLinks = {
    card: `${getEnv().NEXT_PUBLIC_SITE_URL}/${card.slug}`,
    qr: '#',
    googleCalendar: '#',
    directions: '#',
    meetingPoi: preview.meeting ? '#' : null,
    call: preview.phone ? '#' : null,
    messenger: '#',
  };

  return (
    <div className={s.layout}>
      <div className={s.col}>
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
        <Surface tone="tint" pad="sm">
          <p className={s.note}>
            <Icon name="lock" size={16} /> Giữ link trang này riêng tư. Ai có link đều sửa hoặc xoá được thiệp.
          </p>
        </Surface>
        <p className={s.consent}>
          <Icon name="check" size={14} />
          {consent ? (
            <span>
              Bạn đã đồng ý <Link href="/terms">Điều khoản sử dụng</Link> (bản {consent.termsVersion.split('-').reverse().join('/')}) lúc {fmtVn(consent.acceptedAt)}.
              {consent.termsVersion !== TERMS_VERSION ? ' Điều khoản đã có bản mới, mời bạn xem lại.' : ''}
            </span>
          ) : (
            <span>
              Thiệp tạo trước khi có bước xác nhận điều khoản. Xem <Link href="/terms">Điều khoản sử dụng</Link> và <Link href="/privacy">Quyền riêng tư</Link>.
            </span>
          )}
        </p>
      </aside>
    </div>
  );
}
