'use client';

import { useState, type ReactNode } from 'react';
import s from './postcard.module.css';

/** Tấm bưu thiếp lật 3D: bấm để xem mặt sau. Cả hai mặt luôn có trong DOM (đọc màn hình đọc được cả hai). */
export function PostcardFlip({ front, back }: { front: ReactNode; back: ReactNode }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={s.flipWrap}>
      <div className={s.card} data-flipped={flipped ? '' : undefined}>
        <div className={s.face} aria-hidden={flipped}>
          {front}
        </div>
        <div className={`${s.face} ${s.back}`} aria-hidden={!flipped}>
          {back}
        </div>
      </div>
      <button type="button" className={s.flipBtn} onClick={() => setFlipped((v) => !v)} aria-pressed={flipped}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" />
        </svg>
        {flipped ? 'Xem lại mặt trước' : 'Lật xem lời nhắn'}
      </button>
    </div>
  );
}
