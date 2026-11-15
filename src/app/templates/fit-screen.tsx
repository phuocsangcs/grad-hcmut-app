'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import s from './templates.module.css';

/**
 * Màn hình thiệp (390×780) tự co theo bề ngang khung chứa, bo góc nhẹ, không viền điện thoại.
 * Khung chứa quyết định kích thước (vd. 2 cột trên mobile), nên không cần chỉnh scale tay.
 */
export function FitScreen({ children, width = 390, height = 780 }: { children: ReactNode; width?: number; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={box} className={s.fit} style={{ aspectRatio: `${width} / ${height}` }} aria-hidden="true">
      <div className={s.fitInner} style={{ width, height, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
