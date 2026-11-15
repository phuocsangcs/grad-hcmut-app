import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../cx';
import s from './PhoneFrame.module.css';

type Props = { children: ReactNode; scale?: number; className?: string; interactive?: boolean; width?: number; height?: number };

/** Độ dày viền đen quanh màn hình, tính theo hệ toạ độ 390px của trang. */
const BEZEL = 12;

/**
 * Điện thoại thật (viền kim loại, đảo camera, nút bên hông) chứa một trang thật, thu nhỏ bằng transform.
 * Kích thước ngoài = width×height nhân scale; màn hình nằm gọn bên trong viền.
 */
export function PhoneFrame({ children, scale = 1, className, interactive = true, width = 390, height = 780 }: Props) {
  const outerW = width * scale;
  const outerH = height * scale;
  const pad = BEZEL * scale;
  // Màn hình hẹp hơn khung một chút -> thu trang 390px vừa khít bề ngang màn hình.
  const inner = (outerW - pad * 2) / width;
  const screenH = (outerH - pad * 2) / inner;

  return (
    <div
      className={cx(s.phone, className)}
      style={{ width: outerW, height: outerH, padding: pad, '--u': `${scale}px` } as CSSProperties}
    >
      <span className={s.btnSilent} aria-hidden="true" />
      <span className={s.btnVolUp} aria-hidden="true" />
      <span className={s.btnVolDown} aria-hidden="true" />
      <span className={s.btnPower} aria-hidden="true" />
      <div className={s.display}>
        <div
          className={s.screen}
          style={{ width, height: screenH, transform: `scale(${inner})`, pointerEvents: interactive ? 'auto' : 'none' }}
          aria-hidden={!interactive}
        >
          {children}
        </div>
        <span className={s.island} aria-hidden="true" />
      </div>
    </div>
  );
}
