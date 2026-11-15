import { formatTimeVi } from '@/lib/time';
import { cx } from '@/ui';
import s from './blocks.module.css';

type Props = { ceremonyAt: string; venue: string; className?: string; variant?: 'cells' | 'rows' };

const weekday = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long' });
const dayMonth = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit' });

/** Ba ô Ngày · Giờ · Tại. Template có thể đổi vỏ bằng CSS variable --t-*. */
export function CeremonyInfo({ ceremonyAt, venue, className, variant = 'cells' }: Props) {
  const at = new Date(ceremonyAt);
  const wd = weekday.format(at);
  const items = [
    { label: 'Ngày', value: dayMonth.format(at).replace('/', '.'), sub: wd.charAt(0).toUpperCase() + wd.slice(1) },
    { label: 'Giờ', value: formatTimeVi(at), sub: 'Có mặt sớm 30 phút', accent: true },
    { label: 'Tại', value: venue.replace('Hội trường', 'HT'), sub: 'ĐH Bách Khoa' },
  ];
  return (
    <dl className={cx(s.ceremony, variant === 'rows' && s.ceremonyRows, className)}>
      {items.map((i) => (
        <div key={i.label} className={s.ceremonyCell}>
          <dt>{i.label}</dt>
          <dd className={cx(i.accent && s.accent)}>{i.value}</dd>
          <small>{i.sub}</small>
        </div>
      ))}
    </dl>
  );
}
