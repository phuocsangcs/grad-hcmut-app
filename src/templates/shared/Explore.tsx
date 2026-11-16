import Link from 'next/link';
import { Icon, type IconName } from '@/ui';
import { ReportButton } from './ReportButton';
import s from './blocks.module.css';

const ITEMS: { href: string; icon: IconName; title: string; sub: string }[] = [
  { href: '/guide/map', icon: 'map', title: 'Bản đồ trong trường', sub: 'WC, gửi xe, nước, ghế đá' },
  { href: '/eat', icon: 'fork', title: 'Ăn gì sau lễ', sub: 'Quán quanh trường theo ngân sách' },
  { href: '/guide', icon: 'calendar', title: 'Cẩm nang lễ', sub: 'Lịch theo khoa, mẹo đi lễ' },
];

/** Khám phá + CTA tạo thiệp + báo cáo. Tắt link khi preview (tránh rời wizard). */
export function Explore({ slug, preview }: { slug: string; preview?: boolean }) {
  return (
    <section className={s.explore}>
      <ul className={s.exploreList}>
        {ITEMS.map((i) => (
          <li key={i.href}>
            <Link href={preview ? '#' : i.href} className={s.exploreItem} aria-disabled={preview}>
              <span className={s.exploreIcon}>
                <Icon name={i.icon} size={20} />
              </span>
              <span>
                <b>{i.title}</b>
                <small>{i.sub}</small>
              </span>
              <Icon name="arrow" size={16} />
            </Link>
          </li>
        ))}
      </ul>
      {!preview ? (
        <p className={s.exploreFoot}>
          <ReportButton slug={slug} />
        </p>
      ) : null}
    </section>
  );
}
