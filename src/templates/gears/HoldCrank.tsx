'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useGate } from '../shared/Gate';
import s from './gears.module.css';

const FILL_MS = 2400;

/**
 * Nhấn giữ để quay: giữ nút (chuột, ngón tay, phím Space/Enter) thì tiến độ tăng, thả thì dừng.
 * Tiến độ đưa vào CSS qua --p (0..1) để bánh răng xoay và kim đồng hồ chạy; đủ 1 là mở thiệp.
 * "Quay giúp tôi" tự chạy cho người không giữ được lâu.
 */
export function HoldCrank({ children }: { children: ReactNode }) {
  const { phase, open } = useGate();
  const [p, setP] = useState(0);
  const [holding, setHolding] = useState(false);
  const pRef = useRef(0);
  const raf = useRef<number | null>(null);
  const lastT = useRef(0);

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  function loop(t: number) {
    const dt = lastT.current ? t - lastT.current : 16;
    lastT.current = t;
    pRef.current = Math.min(1, pRef.current + dt / FILL_MS);
    setP(pRef.current);
    if (pRef.current >= 1) {
      raf.current = null;
      setHolding(false);
      open();
      return;
    }
    raf.current = requestAnimationFrame(loop);
  }
  function start() {
    if (phase !== 'closed' || raf.current) return;
    setHolding(true);
    lastT.current = 0;
    raf.current = requestAnimationFrame(loop);
  }
  function stop() {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setHolding(false);
  }

  const year = Math.min(4, Math.floor(p * 4 + 0.001));
  return (
    <div className={s.crank} style={{ '--p': p } as CSSProperties} data-year={year} data-holding={holding ? '' : undefined}>
      {children}
      <div className={s.controls}>
        <button
          type="button"
          className={s.hold}
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              start();
            }
          }}
          onKeyUp={stop}
          onContextMenu={(e) => e.preventDefault()}
          disabled={phase !== 'closed'}
        >
          <span className={s.holdRing} aria-hidden="true" />
          <b>{p >= 1 ? 'Xong!' : holding ? 'Đang quay…' : 'Nhấn giữ'}</b>
          <small>{Math.round(p * 100)}%</small>
        </button>
        {phase === 'closed' ? (
          <button type="button" className={s.auto} onClick={start}>
            Quay giúp tôi
          </button>
        ) : null}
      </div>
    </div>
  );
}
