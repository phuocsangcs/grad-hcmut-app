'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import s from './dossier.module.css';

type Phase = 'closed' | 'stamping' | 'leaving' | 'open';

/**
 * Bìa "hồ sơ": khách bấm Mở hồ sơ → mộc ĐÃ TỐT NGHIỆP đóng xuống → bìa trượt lên, lộ nội dung.
 * Nội dung vẫn được render sẵn (ẩn) để form RSVP, đếm ngược… sẵn sàng ngay khi mở.
 * Giảm chuyển động: bỏ qua mộc và hiệu ứng trượt.
 */
export function DossierGate({ cover, children, cta = 'Mở hồ sơ' }: { cover: ReactNode; children: ReactNode; cta?: string }) {
  const [phase, setPhase] = useState<Phase>('closed');
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function open() {
    if (phase !== 'closed') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return setPhase('open');
    setPhase('stamping');
    timers.current.push(
      window.setTimeout(() => setPhase('leaving'), 900),
      window.setTimeout(() => setPhase('open'), 1600),
    );
  }

  return (
    <div className={s.gate} data-phase={phase}>
      {phase !== 'open' ? (
        <section className={s.cover} aria-label="Bìa thiệp">
          {cover}
          <button type="button" className={s.cta} onClick={open} disabled={phase !== 'closed'}>
            <span className={s.ctaHex} aria-hidden="true" />
            {cta}
          </button>
          <div className={s.stamp} aria-hidden="true">
            <span>Đã tốt nghiệp</span>
            <small>Bách Khoa</small>
          </div>
        </section>
      ) : null}
      <div className={s.content} hidden={phase === 'closed' || phase === 'stamping'}>
        {children}
      </div>
    </div>
  );
}
