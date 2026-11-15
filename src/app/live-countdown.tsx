'use client';

import { useEffect, useState } from 'react';
import s from './live-countdown.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Ô đếm ngược sống tới một thời điểm: ngày / giờ / phút / giây, cập nhật mỗi giây.
 * Chưa mount thì hiện "--" để server và client render giống nhau (tránh lỗi hydration).
 */
export function LiveCountdown({ at, className }: { at: string; className?: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(at).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [at]);

  const sec = left === null ? null : Math.floor(left / 1000);
  const cells = [
    { label: 'ngày', value: sec === null ? '--' : String(Math.floor(sec / 86400)) },
    { label: 'giờ', value: sec === null ? '--' : pad(Math.floor((sec % 86400) / 3600)) },
    { label: 'phút', value: sec === null ? '--' : pad(Math.floor((sec % 3600) / 60)) },
    { label: 'giây', value: sec === null ? '--' : pad(sec % 60) },
  ];

  return (
    <div className={[s.root, className].filter(Boolean).join(' ')} role="timer" aria-label="Thời gian còn lại đến lễ">
      {cells.map((c) => (
        <div key={c.label} className={s.cell}>
          <b>{c.value}</b>
          <small>{c.label}</small>
        </div>
      ))}
    </div>
  );
}
