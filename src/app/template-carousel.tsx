'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/ui';
import s from './template-carousel.module.css';

export type Slide = { id: string; label: string; node: ReactNode };

/**
 * Carousel 3D kiểu coverflow: thẻ giữa to và rõ, hai bên nghiêng, nhỏ và mờ dần.
 * Chuyển bằng nút, chấm, bàn phím ←/→, vuốt, hoặc bấm vào thẻ bên cạnh.
 *
 * Chỉnh nhanh (hằng số bên dưới):
 *  - STEP:  khoảng cách ngang giữa hai thẻ liền kề (px, ở kích thước gốc)
 *  - TILT:  góc nghiêng thẻ hai bên (độ)
 *  - FADE:  độ mờ giảm mỗi bậc cách xa thẻ giữa
 *  - VISIBLE: số thẻ hiện mỗi bên
 */
const STEP = 150;
const TILT = 38;
const FADE = 0.28;
const VISIBLE = 3;

export function TemplateCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const drag = useRef<{ x: number } | null>(null);
  // true nếu lần nhấn gần nhất là vuốt (để không coi là bấm vào thẻ)
  const moved = useRef(false);

  const go = (to: number) => setI(((to % n) + n) % n);

  // offset ngắn nhất theo vòng tròn: -n/2 … n/2
  const offsetOf = (k: number) => {
    let d = k - i;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <div
      className={s.root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Các mẫu thiệp"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(i - 1);
        if (e.key === 'ArrowRight') go(i + 1);
      }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX };
        moved.current = false;
      }}
      onPointerMove={(e) => {
        if (drag.current && Math.abs(e.clientX - drag.current.x) > 8) moved.current = true;
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <div className={s.stage}>
        {slides.map((sl, k) => {
          const off = offsetOf(k);
          const abs = Math.abs(off);
          if (abs > VISIBLE) return null;
          const sign = Math.sign(off);
          const style = {
            transform: `translateX(calc(-50% + ${off * STEP}px)) translateZ(${-abs * 90}px) rotateY(${-sign * Math.min(abs, 1) * TILT}deg) scale(${1 - abs * 0.06})`,
            opacity: Math.max(0, 1 - abs * FADE),
            zIndex: 10 - abs,
          } as const;
          return (
            <div
              key={sl.id}
              className={s.slide}
              style={style}
              aria-hidden={off !== 0}
              aria-label={`${sl.label}`}
              onClick={() => {
                if (off !== 0 && !moved.current) go(k);
              }}
              data-active={off === 0}
            >
              {sl.node}
            </div>
          );
        })}
      </div>

      <button type="button" className={`${s.arrow} ${s.prev}`} onClick={() => go(i - 1)} aria-label="Mẫu trước">
        <Icon name="arrow" size={18} style={{ transform: 'rotate(180deg)' }} />
      </button>
      <button type="button" className={`${s.arrow} ${s.next}`} onClick={() => go(i + 1)} aria-label="Mẫu sau">
        <Icon name="arrow" size={18} />
      </button>

      <div className={s.dots} role="tablist" aria-label="Chọn mẫu">
        {slides.map((sl, k) => (
          <button
            key={sl.id}
            type="button"
            role="tab"
            aria-selected={k === i}
            aria-label={sl.label}
            className={s.dot}
            data-on={k === i}
            onClick={() => go(k)}
          />
        ))}
      </div>
      <p className={s.caption} aria-live="polite">{slides[i]?.label}</p>
    </div>
  );
}
