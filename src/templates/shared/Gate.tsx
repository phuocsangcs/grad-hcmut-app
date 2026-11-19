'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import s from './gate.module.css';

export type GatePhase = 'closed' | 'opening' | 'open';

type GateApi = { phase: GatePhase; open: () => void };
const GateContext = createContext<GateApi>({ phase: 'open', open: () => {} });

/** Phần tương tác trên bìa (cào, vuốt, giữ…) gọi `open()` khi khách hoàn tất. */
export const useGate = () => useContext(GateContext);

type Props = {
  /** Bìa thiệp (server render). Phần tương tác bên trong dùng `useGate()` hoặc `<GateButton>`. */
  cover: ReactNode;
  children: ReactNode;
  /** Tổng thời gian hiệu ứng mở (ms); bìa rời đi trong ~600ms cuối. */
  duration?: number;
  /** Cách bìa rời đi khi hết hiệu ứng riêng của mẫu. */
  exit?: 'fade' | 'up' | 'zoom' | 'none';
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * TRANG MỞ THIỆP dùng chung cho các mẫu mới.
 * - closed: chỉ có bìa (một màn hình). Nội dung đã render sẵn nhưng ẩn, để RSVP/đếm ngược sẵn sàng.
 * - opening: mẫu chạy hiệu ứng riêng qua CSS `[data-gate-phase='opening']`; nội dung hiện phía sau bìa.
 * - open: bỏ bìa, cuộn về đầu thiệp.
 * Giảm chuyển động → mở ngay. Lần chạm mở thiệp cũng là lần chạm bật nhạc nền (MusicPlayer).
 */
export function Gate({ cover, children, duration = 1400, exit = 'fade', label = 'Bìa thiệp', className, style }: Props) {
  const [phase, setPhase] = useState<GatePhase>('closed');
  const phaseRef = useRef<GatePhase>('closed');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const set = useCallback((p: GatePhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const open = useCallback(() => {
    if (phaseRef.current !== 'closed') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return set('open');
    set('opening');
    timer.current = window.setTimeout(() => {
      set('open');
      if (window.scrollY > 0) window.scrollTo({ top: 0 });
    }, duration);
  }, [duration, set]);

  return (
    <GateContext.Provider value={{ phase, open }}>
      <div
        className={`${s.gate} ${className ?? ''}`}
        data-gate-phase={phase}
        data-exit={exit}
        style={{ '--gate-ms': `${duration}ms`, ...style } as CSSProperties}
      >
        {phase !== 'open' ? (
          <section className={s.cover} aria-label={label}>
            {cover}
          </section>
        ) : null}
        <div className={s.content} hidden={phase === 'closed'}>
          {children}
        </div>
      </div>
    </GateContext.Provider>
  );
}

/** Nút mở thiệp đặt trong bìa. */
export function GateButton({ className, children, ariaLabel }: { className?: string; children: ReactNode; ariaLabel?: string }) {
  const { phase, open } = useGate();
  return (
    <button type="button" className={className} onClick={open} disabled={phase !== 'closed'} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

/** Nút phụ "Mở luôn" cho bìa cần thao tác (cào, xé, giữ): người lớn tuổi không bị kẹt. */
export function GateSkip({ className, children = 'Mở thiệp luôn' }: { className?: string; children?: ReactNode }) {
  const { phase, open } = useGate();
  if (phase !== 'closed') return null;
  return (
    <button type="button" className={`${s.skip} ${className ?? ''}`} onClick={open}>
      {children}
    </button>
  );
}
