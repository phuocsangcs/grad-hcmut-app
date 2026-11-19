'use client';

import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { useGate } from '../shared/Gate';
import s from './memories.module.css';

const THRESHOLD = 80;

/**
 * Chồng ảnh vuốt được: kéo tấm trên cùng sang trái/phải (hoặc bấm "Tấm tiếp") để lật qua.
 * Tấm cuối (`last`) nằm dưới cùng, chứa nút mở thiệp.
 */
export function SwipeDeck({ cards, last }: { cards: ReactNode[]; last: ReactNode }) {
  const { phase } = useGate();
  const [index, setIndex] = useState(0);
  const [gone, setGone] = useState<number[]>([]);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<number | null>(null);
  const total = cards.length;

  function next(dir = 1) {
    if (index >= total) return;
    setGone((g) => [...g, dir]);
    setIndex((i) => i + 1);
    setDrag(0);
  }

  function onDown(e: PointerEvent<HTMLDivElement>) {
    if (index >= total) return;
    start.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (start.current === null) return;
    setDrag(e.clientX - start.current);
  }
  function onUp() {
    if (start.current === null) return;
    start.current = null;
    setDragging(false);
    if (Math.abs(drag) > THRESHOLD) next(drag > 0 ? 1 : -1);
    else setDrag(0);
  }

  return (
    <div className={s.deckWrap}>
      <div className={s.deck} data-done={index >= total ? '' : undefined}>
        <div className={s.card} style={{ zIndex: 0 } as CSSProperties} data-last="">
          {last}
        </div>
        {cards.map((c, i) => {
          const depth = i - index;
          const isGone = i < index;
          const isTop = i === index;
          const tilt = (i % 2 ? 1 : -1) * (2 + (i % 3));
          const style: CSSProperties = isGone
            ? { transform: `translateX(${gone[i] * 140}%) rotate(${gone[i] * 24}deg)`, opacity: 0, zIndex: total - i }
            : isTop
              ? { transform: `translateX(${drag}px) rotate(${drag / 14}deg)`, zIndex: total - i, transition: dragging ? 'none' : undefined }
              : { transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.04}) rotate(${tilt}deg)`, zIndex: total - i };
          return (
            <div
              key={i}
              className={s.card}
              style={style}
              aria-hidden={!isTop}
              data-top={isTop ? '' : undefined}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? onUp : undefined}
              onPointerCancel={isTop ? onUp : undefined}
            >
              {c}
            </div>
          );
        })}
      </div>
      {index < total && phase === 'closed' ? (
        <div className={s.deckCtl}>
          <span className={s.counter}>
            {index + 1} / {total + 1}
          </span>
          <button type="button" className={s.nextBtn} onClick={() => next(1)}>
            Tấm tiếp theo
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
