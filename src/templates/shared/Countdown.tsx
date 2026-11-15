'use client';

import { useEffect, useState } from 'react';
import { countdown as compute, type Countdown as CountdownData } from '@/modules/card/mode';
import { cx } from '@/ui';
import s from './blocks.module.css';

type Props = { ceremonyAt: string; initial: CountdownData; variant?: 'cells' | 'inline'; className?: string };

/**
 * Đếm ngược sống. Server render giá trị `initial` (đã tính theo giờ VN),
 * client cập nhật mỗi 30 giây. Nhỏ hơn 1 ngày thì đếm giờ/phút.
 */
export function Countdown({ ceremonyAt, initial, variant = 'cells', className }: Props) {
  const [cd, setCd] = useState<CountdownData>(initial);
  useEffect(() => {
    const at = new Date(ceremonyAt);
    const tick = () => setCd(compute(at));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [ceremonyAt]);

  if (variant === 'inline') return <span className={className} suppressHydrationWarning>{inlineText(cd)}</span>;

  const cells = toCells(cd);
  return (
    <div className={cx(s.countdown, className)} aria-label={inlineText(cd)} suppressHydrationWarning>
      {cells.map((c) => (
        <div key={c.label} className={s.cell}>
          <b suppressHydrationWarning>{c.value}</b>
          <small>{c.label}</small>
        </div>
      ))}
    </div>
  );
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function toCells(cd: CountdownData): { value: string; label: string }[] {
  switch (cd.kind) {
    case 'days':
      return [{ value: String(cd.days), label: 'ngày' }];
    case 'hours':
      return [
        { value: pad(cd.hours), label: 'giờ' },
        { value: pad(cd.minutes), label: 'phút' },
      ];
    case 'minutes':
      return [{ value: pad(cd.minutes), label: 'phút' }];
    case 'started':
      return [{ value: '●', label: 'đang diễn ra' }];
  }
}
export function inlineText(cd: CountdownData): string {
  switch (cd.kind) {
    case 'days':
      return `còn ${cd.days} ngày`;
    case 'hours':
      return `còn ${cd.hours} giờ ${pad(cd.minutes)} phút`;
    case 'minutes':
      return `còn ${cd.minutes} phút`;
    case 'started':
      return 'đang diễn ra';
  }
}
