import type { ReactNode } from 'react';
import { cx } from '../cx';
import s from './Prose.module.css';

/** Văn bản dài (giới thiệu, chính sách): nhịp chữ, tiêu đề phụ, danh sách. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(s.prose, className)}>{children}</div>;
}
