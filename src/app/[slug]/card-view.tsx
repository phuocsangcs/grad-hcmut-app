import Link from 'next/link';
import type { PublicCard, PublicCardResult } from '@/modules/card';
import { shareLinks } from '@/modules/share';
import { InvitationCard } from '@/templates';
import { Button, LogoMark } from '@/ui';
import { vi } from '@/lib/i18n';
import s from './card.module.css';

/** Thiệp không mở được: hết hạn, bị khoá. Nhẹ nhàng, có lối ra. */
export function CardUnavailable({ status }: { status: Exclude<PublicCardResult['status'], 'ok'> }) {
  const msg = status === 'expired' ? vi.card.expired : status === 'locked' ? vi.card.locked : vi.card.notFound;
  return (
    <main className={s.unavailable}>
      <LogoMark size={40} />
      <h1>{msg}</h1>
      <p>Thiệp tốt nghiệp tự xoá 30 ngày sau lễ để giữ riêng tư cho gia đình.</p>
      <Button href="/templates">{vi.card.createYourOwn}</Button>
      <Link href="/" className={s.home}>
        Về trang chủ
      </Link>
    </main>
  );
}

/** Lớp mỏng: tính link chia sẻ ở server rồi giao cho hệ template. */
export function CardView({ card, inviteCode }: { card: PublicCard; inviteCode?: string }) {
  return <InvitationCard card={card} links={shareLinks(card, inviteCode)} inviteCode={inviteCode} />;
}
