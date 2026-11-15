'use client';

import { useState } from 'react';
import type { Poi, PoiType } from '@/modules/content';
import { poiSearchUrl } from '@/modules/share/maps-link';
import { Button, Icon, type IconName } from '@/ui';
import s from './map.module.css';

const TYPE_ICON: Record<PoiType, IconName> = {
  hall: 'hex', gate: 'gate', restroom: 'restroom', parking: 'parking', water: 'water', rest: 'tree', photo: 'camera', meeting: 'pin',
};
/** Màu theo loại – dùng token để đổi theme là đổi theo. */
const TYPE_COLOR: Record<PoiType, string> = {
  hall: 'var(--bk-700)', gate: 'var(--bk-500)', restroom: 'var(--muted)', parking: 'var(--muted)',
  water: 'var(--bk-500)', rest: 'var(--leaf)', photo: 'var(--rose-ink)', meeting: 'var(--sun-ink)',
};

type Props = { pois: Poi[]; types: Partial<Record<PoiType, string>>; width: number; height: number };

/**
 * Bản đồ minh hoạ (SVG, không tải bản đồ ngoài → nhẹ, chạy được khi mạng yếu).
 * Bấm điểm trên bản đồ hoặc trong danh sách để xem chi tiết; lọc theo loại.
 */
export function CampusMap({ pois, types, width, height }: Props) {
  const [filter, setFilter] = useState<PoiType | null>(null);
  const [selected, setSelected] = useState<string | null>('a5');
  const visible = pois.filter((p) => !filter || p.type === filter || p.type === 'hall');
  const sel = pois.find((p) => p.id === selected) ?? null;
  const a5 = pois.find((p) => p.type === 'hall');
  const gate = pois.find((p) => p.id === 'gate-main');

  return (
    <div className={s.wrap}>
      <div className={s.filters} role="group" aria-label="Lọc theo loại">
        <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>Tất cả</button>
        {(Object.keys(types) as PoiType[]).filter((t) => t !== 'hall' && pois.some((p) => p.type === t)).map((t) => (
          <button type="button" key={t} aria-pressed={filter === t} onClick={() => setFilter(filter === t ? null : t)}>
            <Icon name={TYPE_ICON[t]} size={14} /> {types[t]}
          </button>
        ))}
      </div>

      <div className={s.grid}>
        <div className={s.mapBox}>
          <svg viewBox={`0 0 ${width} ${height}`} className={s.svg} role="img" aria-label="Bản đồ minh hoạ khuôn viên trường">
            <defs>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.6" fill="var(--bk-200)" />
              </pattern>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="url(#dots)" />
            {/* khuôn viên */}
            <rect x="60" y="60" width={width - 120} height={height - 120} rx="28" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
            {/* trục đường chính: cổng → A5 */}
            {gate && a5 && <path d={`M${gate.x} ${height - 60} L${gate.x} ${a5.y + 50}`} stroke="var(--bk-100)" strokeWidth="34" strokeLinecap="round" />}
            <path d={`M90 ${height / 2 + 60} H${width - 90}`} stroke="var(--bk-100)" strokeWidth="22" strokeLinecap="round" />
            {/* mảng xanh */}
            <ellipse cx="800" cy="410" rx="90" ry="55" fill="var(--bk-200)" opacity="0.7" />
            {[[300, 500], [360, 520], [640, 500], [700, 470], [420, 120], [240, 300], [860, 200]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="16" fill="var(--leaf-soft)" stroke="var(--leaf)" strokeOpacity="0.4" />
            ))}
            {/* hội trường */}
            {a5 && (
              <g>
                <rect x={a5.x - 90} y={a5.y - 55} width="180" height="100" rx="10" fill="var(--bk-700)" />
                <text x={a5.x} y={a5.y + 4} textAnchor="middle" fill="#fff" fontSize="30" fontWeight="800" fontFamily="var(--font-sans)">A5</text>
              </g>
            )}
            <text x={width / 2 - 220} y={height - 24} textAnchor="middle" fontSize="18" fill="var(--muted)" fontFamily="var(--font-mono)">ĐƯỜNG LÝ THƯỜNG KIỆT</text>

            {visible.filter((p) => p.type !== 'hall').map((p) => {
              const on = p.id === selected;
              return (
                <g
                  key={p.id}
                  className={s.marker}
                  transform={`translate(${p.x} ${p.y})`}
                  onClick={() => setSelected(p.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={p.name}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(p.id); }}
                >
                  <circle r={on ? 22 : 16} fill={TYPE_COLOR[p.type]} stroke="#fff" strokeWidth="4" />
                  {on && <circle r="32" fill="none" stroke={TYPE_COLOR[p.type]} strokeWidth="2" opacity="0.5" />}
                </g>
              );
            })}
          </svg>
        </div>

        <div className={s.side}>
          {sel ? (
            <div className={s.detail}>
              <span className={s.detailType} style={{ color: TYPE_COLOR[sel.type] }}>
                <Icon name={TYPE_ICON[sel.type]} size={16} /> {types[sel.type]}
              </span>
              <h2>{sel.name}</h2>
              {sel.note ? <p>{sel.note}</p> : null}
              <Button href={poiSearchUrl(sel)} target="_blank" rel="noreferrer" variant="secondary" size="sm" trailing={<Icon name="external" size={14} />}>Mở Google Maps</Button>
            </div>
          ) : null}
          <ul className={s.list}>
            {visible.map((p) => (
              <li key={p.id}>
                <button type="button" aria-pressed={p.id === selected} onClick={() => setSelected(p.id)}>
                  <span className={s.dot} style={{ background: TYPE_COLOR[p.type] }} aria-hidden="true" />
                  <span>{p.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
