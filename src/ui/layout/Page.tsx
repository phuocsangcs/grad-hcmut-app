import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { cx } from '../cx';
import s from './Page.module.css';

type Props = {
  children: ReactNode;
  /** Chiều rộng nội dung. */
  width?: 'default' | 'narrow';
  /** Bỏ header/footer (trang thiệp có bố cục riêng). */
  bare?: boolean;
  className?: string;
};

/** Khung trang chuẩn cho các trang thông tin: header + nội dung + footer. */
export function Page({ children, width = 'default', bare, className }: Props) {
  if (bare) return <>{children}</>;
  return (
    <>
      <SiteHeader />
      <main className={cx(s.main, width === 'narrow' && s.narrow, className)}>{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHeading({ eyebrow, title, lead }: { eyebrow?: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <header className={s.heading}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className={s.title}>{title}</h1>
      {lead ? <p className={s.lead}>{lead}</p> : null}
    </header>
  );
}
