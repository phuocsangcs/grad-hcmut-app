import Link from 'next/link';
import { Logo } from '../primitives/Logo';
import { Button } from '../primitives/Button';
import { cx } from '../cx';
import s from './SiteHeader.module.css';

const NAV = [
  { href: '/guide', label: 'Lịch theo khoa' },
  { href: '/guide/map', label: 'Bản đồ trường' },
  { href: '/eat', label: 'Ăn gì' },
];

type Props = {
  /** Đặt đè lên ảnh hero (nổi, không chiếm chỗ). */
  overlay?: boolean;
  className?: string;
};

/**
 * Thanh menu dạng viên kính. Trên điện thoại chỉ còn logo + nút Tạo thiệp,
 * các mục còn lại nằm trong <details> để không cần JS.
 */
export function SiteHeader({ overlay, className }: Props) {
  return (
    <header className={cx(s.wrap, overlay && s.overlay, className)}>
      <nav className={s.bar} aria-label="Chính">
        <Logo />
        <div className={s.links}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={s.link}>
              {n.label}
            </Link>
          ))}
        </div>
        <div className={s.actions}>
          <details className={s.menu}>
            <summary className={s.menuBtn} aria-label="Mở menu">
              <span />
              <span />
              <span />
            </summary>
            <div className={s.menuSheet}>
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className={s.menuLink}>
                  {n.label}
                </Link>
              ))}
              <Link href="/about" className={s.menuLink}>
                Về dự án
              </Link>
            </div>
          </details>
          <Button href="/templates" size="md">
            Tạo thiệp
          </Button>
        </div>
      </nav>
    </header>
  );
}
