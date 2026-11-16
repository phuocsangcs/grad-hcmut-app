'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/ui';
import s from './layout.module.css';

type Tab = { href: string; label: string; sub: string; icon: IconName; active: boolean };

/** Hai tab lớn ở đầu trang quản lý: Thiệp | Khách mời. */
export function ManageTabs({ token, guests, confirmed }: { token: string; guests: number; confirmed: number }) {
  const path = usePathname();
  const base = `/manage/${token}`;
  const onGuests = path.startsWith(`${base}/invites`);
  const tabs: Tab[] = [
    { href: base, label: 'Thiệp', sub: 'Sửa nội dung, xem trước', icon: 'edit', active: !onGuests },
    { href: `${base}/invites`, label: 'Khách mời', sub: `${guests} khách · ${confirmed} xác nhận`, icon: 'users', active: onGuests },
  ];
  return (
    <nav className={s.tabs} aria-label="Quản lý">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={s.tab} aria-current={t.active ? 'page' : undefined} scroll={false}>
          <Icon name={t.icon} size={20} />
          <span>
            <b>{t.label}</b>
            <small>{t.sub}</small>
          </span>
        </Link>
      ))}
    </nav>
  );
}
