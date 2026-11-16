import type { ReactNode } from 'react';
import { getEnv } from '@/lib/env';
import { formatDateVi, formatTimeVi } from '@/lib/time';
import { inviteRepo } from '@/modules/invite';
import { rsvpSummary } from '@/modules/rsvp';
import { Button, Chip, CopyButton, Icon, Page, PageHeading, ShareButton } from '@/ui';
import { loadManagedCard } from './load-card';
import { ManageTabs } from './manage-tabs';
import s from './layout.module.css';

type Props = { children: ReactNode; params: Promise<{ token: string }> };

// Khai báo lại template: title dạng chuỗi ở layout sẽ làm mất template của root cho các tab con.
export const metadata = { title: { default: 'Quản lý thiệp', template: '%s · Ngày Ra Trường' }, robots: { index: false } };

/**
 * Khung chung của trang quản lý: thông tin thiệp + link chung + QR, rồi 2 tab Thiệp | Khách mời.
 * Mỗi tab chỉ lo phần của mình, không lặp lại các nút ở đây.
 */
export default async function ManageLayout({ children, params }: Props) {
  const { token } = await params;
  const card = await loadManagedCard(token);
  if (!card) {
    return (
      <Page width="narrow">
        <PageHeading title="Không tìm thấy thiệp" lead="Link quản lý không đúng, hoặc thiệp đã bị xoá / hết hạn." />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button href="/templates">Tạo thiệp mới</Button>
          <Button href="/about#recover" variant="ghost">
            Lấy lại link bằng email
          </Button>
        </div>
      </Page>
    );
  }

  const [guests, summary] = await Promise.all([inviteRepo.countByCard(card.id), rsvpSummary(card.id)]);
  const cardUrl = `${getEnv().NEXT_PUBLIC_SITE_URL}/${card.slug}`;

  return (
    <Page>
      <header className={s.head}>
        <div className={s.headInfo}>
          <h1>Thiệp của {card.displayName}</h1>
          <div className={s.meta}>
            <Chip tone="primary" dot>
              {formatDateVi(card.ceremonyAt)} · {formatTimeVi(card.ceremonyAt)}
            </Chip>
            <Chip>{card.venue}</Chip>
            <Chip tone="outline">/{card.slug}</Chip>
          </div>
        </div>
        <div className={s.headActions}>
          <CopyButton text={cardUrl} label="Copy link chung" doneLabel="Đã chép link" />
          <ShareButton url={cardUrl} label="Gửi" variant="secondary" />
          <Button href={cardUrl} variant="secondary" target="_blank" rel="noreferrer" leading={<Icon name="external" size={16} />}>
            Mở thiệp
          </Button>
          <Button href={`/api/cards/${card.slug}/qr?size=1024`} variant="secondary" download leading={<Icon name="qr" size={16} />}>
            Tải QR
          </Button>
        </div>
      </header>

      <ManageTabs token={token} guests={guests} confirmed={summary.responses} />

      {children}
    </Page>
  );
}
