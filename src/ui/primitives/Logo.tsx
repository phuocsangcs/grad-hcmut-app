import Link from 'next/link';
import { cx } from '../cx';
import s from './Logo.module.css';

/**
 * Dấu hiệu của web: lục giác (gợi tổ ong Bách Khoa) + mũ cử nhân vàng.
 * Tự vẽ, không dùng logo của Trường.
 */
export function LogoMark({ size = 28, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true">
      <path d="M15 2 L27 9 L27 21 L15 28 L3 21 L3 9 Z" fill={light ? '#FFFFFF' : 'var(--bk-700)'} />
      <path d="M15 9 L22 13 L15 17 L8 13 Z" fill="var(--sun)" />
      <path d="M11 14.5 V18 Q15 20.5 19 18 V14.5" fill="none" stroke={light ? 'var(--bk-700)' : '#FFFFFF'} strokeWidth="1.6" />
    </svg>
  );
}

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cx(s.logo, light && s.light, className)} aria-label="Ngày Ra Trường – trang chủ">
      <LogoMark light={light} />
      <span>Ngày Ra Trường</span>
    </Link>
  );
}
