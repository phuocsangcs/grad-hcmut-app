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
  /** Ẩn footer (trang làm việc như form tạo thiệp). */
  noFooter?: boolean;
  /** Class bọc header, ví dụ để ẩn header trên điện thoại. */
  headerClassName?: string;
};

/** Khung trang chuẩn cho các trang thông tin: header + nội dung + footer. */
export function Page({ children, width = 'default', bare, className, noFooter, headerClassName }: Props) {
  if (bare) return <>{children}</>;
  return (
    <>
      {headerClassName ? <div className={headerClassName}><SiteHeader /></div> : <SiteHeader />}
      <main className={cx(s.main, width === 'narrow' && s.narrow, className)}>{children}</main>
      {noFooter ? null : <SiteFooter />}
    </>
  );
}

export function PageHeading({ title, lead }: { title: ReactNode; lead?: ReactNode }) {
  return (
    <header className={s.heading}>
      <h1 className={s.title}>{title}</h1>
      {lead ? <p className={s.lead}>{lead}</p> : null}
    </header>
  );
}
