import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx';
import s from './Chip.module.css';

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'primary' | 'leaf' | 'sun' | 'rose' | 'outline';
  dot?: boolean;
  children: ReactNode;
};

/** Nhãn nhỏ: ngày giờ, trạng thái, nhóm khách. */
export function Chip({ tone = 'neutral', dot, className, children, ...rest }: Props) {
  return (
    <span className={cx(s.chip, s[tone], className)} {...rest}>
      {dot ? <span className={s.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
