'use client';

import { useState, type ReactNode } from 'react';
import { useGate } from '../shared/Gate';
import s from './calendar.module.css';

/**
 * Tập lịch xé: chạm tờ trên cùng (hoặc nút Xé) để xé bay tờ đó. Tờ cuối (`last`) không xé, chứa nút mở thiệp.
 */
export function TearPad({ pages, last }: { pages: ReactNode[]; last: ReactNode }) {
  const { phase } = useGate();
  const [torn, setTorn] = useState(0);
  const left = pages.length - torn;
  const tear = () => setTorn((t) => Math.min(pages.length, t + 1));

  return (
    <>
      <div className={s.pad}>
        <div className={s.sheet} data-last="">
          {last}
        </div>
        {pages.map((p, i) => {
          const state = i < torn ? 'torn' : i === torn ? 'top' : 'under';
          return (
            <div
              key={i}
              className={s.sheet}
              data-state={state}
              style={{ zIndex: pages.length - i + 1 }}
              aria-hidden={state !== 'top'}
              onClick={state === 'top' ? tear : undefined}
            >
              {p}
            </div>
          );
        })}
        <span className={s.padEdge} aria-hidden="true" />
      </div>
      {left > 0 && phase === 'closed' ? (
        <button type="button" className={s.tearBtn} onClick={tear}>
          Xé tờ lịch <small>(còn {left} tờ)</small>
        </button>
      ) : null}
    </>
  );
}
