import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCardByToken } from '@/modules/manage';
import { listInvites } from '@/modules/invite';
import { greetingsFile } from '@/modules/content';
import { HttpError } from '@/lib/http';
import { Icon } from '@/ui';
import { PrintButton } from './print-button';
import s from './print.module.css';

type Props = { params: Promise<{ token: string }> };

export const metadata = { title: 'In QR khách mời', robots: { index: false } };

/** Trang in: mỗi khách một thẻ có QR riêng, khổ A4 (3 × 4 thẻ một trang). */
export default async function PrintQrPage({ params }: Props) {
  const { token } = await params;
  let card;
  try {
    card = await requireCardByToken(token);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
  const list = await listInvites(card.slug, card.id);
  const cardLead = card.inviteLead || greetingsFile.defaultInviteLead;

  return (
    <main className={s.root}>
      <header className={s.toolbar}>
        <Link href={`/manage/${token}/invites`} className={s.back}>
          <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} /> Quản lý khách mời
        </Link>
        <span className={s.count}>{list.length} thẻ · khổ A4, 12 thẻ mỗi trang</span>
        <PrintButton disabled={list.length === 0} />
      </header>

      {list.length === 0 ? (
        <p className={s.empty}>Chưa có khách nào để in. Thêm khách ở trang quản lý khách mời trước.</p>
      ) : (
        <ul className={s.grid}>
          {list.map((i) => (
            <li key={i.id} className={s.cardItem}>
              <span className={s.lead}>{i.greeting || cardLead}</span>
              <b className={s.name}>{i.recipientName}</b>
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR sinh động từ API */}
              <img src={`/api/cards/${card.slug}/qr?code=${i.code}&size=360`} alt={`QR của ${i.recipientName}`} width={120} height={120} loading="eager" />
              <span className={s.from}>Lễ tốt nghiệp của {card.displayName}</span>
              <span className={s.url}>
                /{card.slug}/{i.code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
