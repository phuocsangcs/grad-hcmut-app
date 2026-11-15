import { createElement, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../cx';
import s from './Surface.module.css';

export type SurfaceTone = 'card' | 'glass' | 'navy' | 'tint' | 'outline';

type Props = HTMLAttributes<HTMLElement> & {
  tone?: SurfaceTone;
  /** Lượng đệm bên trong. */
  pad?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'section' | 'article' | 'aside' | 'li';
  children: ReactNode;
};

/**
 * Bề mặt dùng chung: thẻ trắng, khối xanh đậm, mảng màu nhạt. Phẳng, viền mảnh, không bóng.
 */
export function Surface({ tone = 'card', pad = 'md', as = 'div', className, children, ...rest }: Props) {
  return createElement(as, { ...rest, className: cx(s.surface, s[tone], s[`pad-${pad}`], className) }, children);
}
