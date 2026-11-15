'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  /** Mỗi 1px cuộn trang thì lớp này dịch lên bao nhiêu px (0.1 = nhẹ, 0.3 = nhiều). */
  speed: number;
  /** Giới hạn quãng dịch tối đa (px) để điện thoại không trôi khỏi hero. */
  max?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Dịch lớp con lên/xuống theo lượng cuộn trang. Ghi thẳng vào biến CSS --py của phần tử
 * (không setState nên không render lại); CSS tự dùng `translate: 0 var(--py)`.
 * Tắt khi người dùng bật "giảm chuyển động".
 */
export function ParallaxLayer({ speed, max = 140, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(window.scrollY * speed, max);
      el.style.setProperty('--py', `${-y}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, max]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
