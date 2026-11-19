'use client';

import { useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Cap } from './Cap';
import s from './capfly.module.css';

type Flying = { id: number; x: number; y: number; r: number };

/**
 * Bầu trời bấm được: chạm chỗ nào là một chiếc mũ bay lên từ chỗ đó.
 * Không chặn chạm vào nút/link bên trong.
 */
export function CapToss({ children, className }: { children: ReactNode; className?: string }) {
  const [caps, setCaps] = useState<Flying[]>([]);
  const [count, setCount] = useState(0);
  const seq = useRef(0);

  function toss(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('a,button,input,textarea,label')) return;
    const box = e.currentTarget.getBoundingClientRect();
    const id = ++seq.current;
    const cap = { id, x: e.clientX - box.left, y: e.clientY - box.top, r: (id * 97) % 360 };
    setCaps((c) => [...c.slice(-10), cap]);
    setCount((n) => n + 1);
    window.setTimeout(() => setCaps((c) => c.filter((x) => x.id !== id)), 1600);
  }

  return (
    <div className={`${s.toss} ${className ?? ''}`} onClick={toss}>
      {children}
      {caps.map((c) => (
        <span key={c.id} className={s.flyCap} style={{ left: c.x, top: c.y, '--r': `${c.r}deg` } as CSSProperties} aria-hidden="true">
          <Cap />
        </span>
      ))}
      <p className={s.tossCount} aria-live="polite">
        {count === 0 ? 'Chạm vào bầu trời để tung mũ' : `Đã tung ${count} chiếc mũ 🎓`}
      </p>
    </div>
  );
}
