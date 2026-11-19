'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useGate } from '../shared/Gate';
import s from './chat.module.css';

const fmt = (d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
const fmtDate = (d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', day: 'numeric', month: 'long' }).format(d);

/** Đồng hồ màn hình khoá: giờ thật của người xem, cập nhật mỗi 20 giây. */
export function LockClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className={s.clock}>
      <span className={s.clockDate} suppressHydrationWarning>
        {now ? fmtDate(now) : ' '}
      </span>
      <b className={s.clockTime} suppressHydrationWarning>
        {now ? fmt(now) : ' '}
      </b>
    </div>
  );
}

/**
 * Luồng tin nhắn hiện dần sau khi mở thiệp, có dấu "đang soạn tin" trước mỗi tin.
 * Mọi tin vẫn nằm trong DOM (ẩn) để form RSVP sẵn sàng; nút "Xem hết" hiện ngay toàn bộ.
 * Xem trước / giảm chuyển động: hiện hết.
 */
export function ChatThread({ items, instant }: { items: ReactNode[]; instant?: boolean }) {
  const { phase } = useGate();
  const [shown, setShown] = useState(instant ? items.length : 1);

  useEffect(() => {
    if (instant || phase === 'closed' || shown >= items.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setTimeout(() => setShown((n) => (reduce ? items.length : n + 1)), reduce ? 0 : shown < 3 ? 900 : 650);
    return () => window.clearTimeout(id);
  }, [phase, shown, items.length, instant]);

  const typing = shown < items.length;
  return (
    <div className={s.thread}>
      {items.map((it, i) => (
        <div key={i} className={s.item} hidden={i >= shown}>
          {it}
        </div>
      ))}
      {typing ? (
        <div className={s.typingRow}>
          <span className={s.typing} aria-label="Đang soạn tin">
            <i />
            <i />
            <i />
          </span>
          <button type="button" className={s.skipAll} onClick={() => setShown(items.length)}>
            Xem hết tin nhắn
          </button>
        </div>
      ) : null}
    </div>
  );
}
