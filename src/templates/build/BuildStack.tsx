'use client';

import { useState } from 'react';
import { GateButton, useGate } from '../shared/Gate';
import s from './build.module.css';

const FLOORS = [
  { year: 'Năm 1', part: 'Móng · Đại cương' },
  { year: 'Năm 2', part: 'Khung · Cơ sở ngành' },
  { year: 'Năm 3', part: 'Tường · Chuyên ngành' },
  { year: 'Năm 4', part: 'Mái · Đồ án' },
];

/**
 * Công trường: cần cẩu thả từng tầng. Mỗi lần bấm "Xây" là một năm học; đủ 4 tầng thì cắm cờ
 * và hiện nút Nghiệm thu (mở thiệp).
 */
export function BuildStack({ flag }: { flag: string }) {
  const { phase } = useGate();
  const [built, setBuilt] = useState(0);
  const done = built >= FLOORS.length;
  const next = FLOORS[built];

  return (
    <div className={s.site} data-built={built} data-done={done ? '' : undefined}>
      <div className={s.scene} aria-hidden="true">
        <svg className={s.crane} viewBox="0 0 200 260">
          <path d="M40 260V20" className={s.mast} />
          <path d="M30 260V20M50 260V20" className={s.mastSide} />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M30 ${260 - i * 20}L50 ${240 - i * 20}`} className={s.mastSide} />
          ))}
          <path d="M8 26H196" className={s.jib} />
          <path d="M8 34H196" className={s.mastSide} />
          <path d="M40 4 8 26M40 4 196 26" className={s.mastSide} />
          <rect x="6" y="30" width="22" height="18" className={s.weight} />
          <rect x="34" y="18" width="14" height="18" className={s.cab} />
          <g className={s.hook}>
            <path d="M150 34V96" className={s.cable} />
            <path d="M144 96h12l-6 10z" className={s.hookHead} />
          </g>
        </svg>
        <div className={s.tower}>
          <div className={s.flag}>
            <span>{flag}</span>
          </div>
          {FLOORS.map((f, i) => (
            <div key={f.year} className={s.floor} data-i={i} data-on={i < built ? '' : undefined}>
              <b>{f.year}</b>
              <span>{f.part}</span>
            </div>
          )).reverse()}
          <div className={s.base} />
        </div>
        <div className={s.ground} />
      </div>

      <div className={s.ctl}>
        <p className={s.progress} aria-live="polite">
          {done ? 'Công trình đã hoàn thiện!' : `Tiến độ: ${built}/4 tầng`}
        </p>
        {done ? (
          <GateButton className={s.accept}>Nghiệm thu công trình</GateButton>
        ) : phase === 'closed' ? (
          <button type="button" className={s.buildBtn} onClick={() => setBuilt((b) => b + 1)}>
            Xây tầng {built + 1} · {next.year}
          </button>
        ) : null}
      </div>
    </div>
  );
}
