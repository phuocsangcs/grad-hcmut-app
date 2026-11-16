'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Poi, PoiType } from '@/modules/content';
import { poiSearchUrl } from '@/modules/share/maps-link';
import { Button, Icon, type IconName } from '@/ui';
import { BUILDINGS, CAMPUS, ENTRANCES, FLATS, STREETS, TREES, type Building, type BuildingKind, type Flat } from './campus-data';
import { boxFaces, bounds, FLOOR, makeProjector, pts, type Projector, type Pt, type View } from './iso';
import s from './map.module.css';

const TYPE_ICON: Record<PoiType, IconName> = {
  hall: 'hex', gate: 'gate', restroom: 'restroom', parking: 'parking', water: 'water', rest: 'tree', photo: 'camera', meeting: 'pin',
};
/** Màu ghim theo loại điểm. */
const TYPE_COLOR: Record<PoiType, string> = {
  hall: '#032b91', gate: '#1488db', restroom: '#3d5a80', parking: '#3d5a80', water: '#1488db', rest: '#1f9d68', photo: '#d9577f', meeting: '#b7791f',
};
/** Màu nóc / tường theo loại toà. */
const KIND_COLOR: Record<BuildingKind, { top: string; wall: string; text: string; line: string }> = {
  hall: { top: '#1d4fb8', wall: '#032b91', text: '#ffffff', line: 'rgba(255,255,255,0.35)' },
  faculty: { top: '#ffffff', wall: '#c9d6ea', text: '#032b91', line: 'rgba(3,43,145,0.18)' },
  office: { top: '#f5f7fa', wall: '#d3dae4', text: '#3d5a80', line: 'rgba(3,43,145,0.14)' },
  lab: { top: '#eef1f5', wall: '#c6ced9', text: '#5d6f8c', line: 'rgba(3,43,145,0.12)' },
  glass: { top: '#dcf0fa', wall: '#8cc6e4', text: '#032b91', line: 'rgba(255,255,255,0.55)' },
};
const HOT = { top: '#ffe9b3', wall: '#f4b740', text: '#0a1a3d', line: 'rgba(10,26,61,0.18)' };

const VIEW_3D: View = { theta: -14, tilt: 52 };
const VIEW_2D: View = { theta: 0, tilt: 0 };
const THETA_LIMIT = 40;
const ZOOM_MAX = 2.8;

type Selected = { kind: 'building'; id: string } | { kind: 'poi'; id: string } | null;
type Props = { pois: Poi[]; types: Partial<Record<PoiType, string>>; faculties: { id: string; name: string }[] };

/** Góc nhìn chuyển mượt về đích (rAF). Giảm chuyển động → nhảy thẳng. */
function useAnimatedView(target: View) {
  const [view, setView] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const step = () => {
      const c = cur.current;
      const next = { theta: c.theta + (target.theta - c.theta) * 0.16, tilt: c.tilt + (target.tilt - c.tilt) * 0.16 };
      const done = reduce || (Math.abs(next.theta - target.theta) < 0.05 && Math.abs(next.tilt - target.tilt) < 0.05);
      cur.current = done ? target : next;
      setView(cur.current);
      if (!done) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return view;
}

/**
 * Bản đồ khuôn viên 2.5D (SVG tự vẽ, không tải thư viện hay bản đồ ngoài).
 * Đưa chuột: toà nhô lên. Bấm: xem toà / khoa. Kéo ngang: xoay nhẹ. Nút 3D/2D: camera nghiêng ↔ nhìn thẳng.
 */
export function CampusMap({ pois, types, faculties }: Props) {
  const [target, setTarget] = useState<View>(VIEW_3D);
  const view = useAnimatedView(target);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selected>({ kind: 'building', id: 'a5' });
  const [filter, setFilter] = useState<PoiType | null>(null);
  const drag = useRef<{ x: number; y: number; theta: number; pan: { x: number; y: number }; moved: boolean } | null>(null);
  // Phóng to (1 = vừa khung) và độ dời khi đang phóng to, theo đơn vị viewBox.
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Bấm toà (bỏ qua nếu vừa kéo để xoay) và hover; ổn định để không vẽ lại toà nhà thừa.
  const pick = useCallback((id: string) => {
    if (drag.current?.moved) return;
    setSelected({ kind: 'building', id });
  }, []);
  const onHover = useCallback((id: string, on: boolean) => setHover((v) => (on ? id : v === id ? null : v)), []);

  // Link có #2d thì mở sẵn kiểu nhìn thẳng (tiện gửi cho người lớn tuổi, dễ đọc hơn).
  // (trì hoãn một frame như ở form tạo thiệp, không setState đồng bộ trong effect)
  useEffect(() => {
    if (window.location.hash !== '#2d') return;
    const id = requestAnimationFrame(() => setTarget(VIEW_2D));
    return () => cancelAnimationFrame(id);
  }, []);

  const P = useMemo(() => makeProjector(view), [view]);
  const is3d = target.tilt > 1;

  // viewBox ôm sát khuôn viên (+ một dải đường và tên đường), cộng phần nhô của toà cao nhất.
  // Không lấy cả đoạn đường kéo dài để bản đồ không bị thu nhỏ vô ích.
  const box = useMemo(() => {
    const ground: Pt[] = [...CAMPUS, [60, 646], [996, 646], [96, 372], [168, 150]];
    return bounds([...ground.map(([x, y]) => P.project(x, y, 0)), ...CAMPUS.map(([x, y]) => P.project(x, y, 7 * FLOOR))], 10);
  }, [P]);

  // Khung nhìn thật: thu theo zoom quanh tâm + độ dời, không cho trôi ra ngoài khuôn viên.
  const vb = useMemo(() => {
    const w = box.w / zoom, h = box.h / zoom;
    const maxX = (box.w - w) / 2, maxY = (box.h - h) / 2;
    const px = Math.max(-maxX, Math.min(maxX, pan.x)), py = Math.max(-maxY, Math.min(maxY, pan.y));
    return { x: box.x + (box.w - w) / 2 + px, y: box.y + (box.h - h) / 2 + py, w, h };
  }, [box, zoom, pan]);
  const setZoomTo = (z: number) => {
    const next = Math.round(Math.max(1, Math.min(ZOOM_MAX, z)) * 10) / 10;
    setZoom(next);
    if (next === 1) setPan({ x: 0, y: 0 });
  };

  const facultyBuilding = (fid: string) => BUILDINGS.find((b) => b.facultyIds?.includes(fid));
  const selBuilding = selected?.kind === 'building' ? BUILDINGS.find((b) => b.id === selected.id) : undefined;
  const selPoi = selected?.kind === 'poi' ? pois.find((p) => p.id === selected.id) : undefined;
  const visiblePois = pois.filter((p) => p.type !== 'hall' && (!filter || p.type === filter));

  // Vật thể có chiều cao, vẽ từ xa đến gần.
  const items = useMemo(() => {
    const list: { depth: number; el: React.ReactNode }[] = [];
    for (const b of BUILDINGS) {
      b.boxes.forEach((bx, i) => {
        const isSel = selected?.kind === 'building' && selected.id === b.id;
        const hot = hover === b.id || isSel;
        // Chỉ toà ĐANG CHỌN mới nhô lên. Nhô khi hover sẽ làm toà trượt khỏi con trỏ
        // → pointerleave → hạ xuống → pointerenter… lặp vô hạn.
        const lift = isSel && P.st > 0.02 ? 6 : 0;
        const f = boxFaces(P, bx.x, bx.y, bx.w, bx.d, bx.floors * FLOOR, lift);
        list.push({ depth: f.depth, el: (
            <BuildingBox
              key={`${b.id}-${i}`}
              b={b}
              index={i}
              faces={f}
              floors={bx.floors}
              hot={hot}
              pressed={selected?.kind === 'building' && selected.id === b.id}
              label={P.project(bx.x + bx.w / 2, bx.y + bx.d / 2, bx.floors * FLOOR + lift)}
              onHover={onHover}
              onPick={pick}
            />
          ),
        });
      });
    }
    TREES.forEach(([x, y], i) => {
      const [gx, gy] = P.project(x, y, 0);
      const [tx, ty] = P.project(x, y, 10);
      list.push({
        depth: P.rot(x, y)[1],
        el: (
          <g key={`t${i}`} aria-hidden="true">
            <ellipse cx={gx + 3} cy={gy + 1} rx={9} ry={9 * P.ct + 1.5} fill="rgba(10,26,61,0.12)" />
            <circle cx={tx} cy={ty} r={9} fill="#3fa968" />
            <circle cx={tx - 2.5} cy={ty - 2.5} r={4.5} fill="#6cc78a" />
          </g>
        ),
      });
    });
    return list.sort((a, b) => a.depth - b.depth).map((x) => x.el);
  }, [P, hover, selected, pick, onHover]);

  return (
    <div className={s.wrap}>
      <div className={s.grid}>
        <div className={s.mapBox}>
          <svg
            viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            preserveAspectRatio="xMidYMid meet"
            className={s.svg}
            data-zoomed={zoom > 1 || undefined}
            role="group"
            aria-label="Bản đồ khuôn viên Trường Đại học Bách Khoa, cơ sở Lý Thường Kiệt"
            onPointerDown={(e) => {
              drag.current = { x: e.clientX, y: e.clientY, theta: target.theta, pan, moved: false };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d || !(e.buttons & 1)) return;
              const dx = e.clientX - d.x;
              const dy = e.clientY - d.y;
              if (Math.hypot(dx, dy) > 4) d.moved = true;
              if (!d.moved) return;
              if (zoom > 1) {
                // Đang phóng to: kéo để di chuyển bản đồ (đổi px màn hình → đơn vị viewBox).
                const k = vb.w / e.currentTarget.clientWidth;
                const maxX = (box.w - vb.w) / 2, maxY = (box.h - vb.h) / 2;
                setPan({ x: Math.max(-maxX, Math.min(maxX, d.pan.x - dx * k)), y: Math.max(-maxY, Math.min(maxY, d.pan.y - dy * k)) });
              } else {
                setTarget((v) => ({ ...v, theta: Math.max(-THETA_LIMIT, Math.min(THETA_LIMIT, d.theta + dx * 0.25)) }));
              }
            }}
            onPointerUp={() => {
              // để onClick của toà nhà (chạy sau pointerup) biết vừa kéo hay bấm
              setTimeout(() => (drag.current = null), 0);
            }}
          >
            {STREETS.map((st) => (
              <Street key={st.name} street={st} P={P} />
            ))}
            <polygon points={pts(CAMPUS.map(([x, y]) => P.project(x, y)))} className={s.ground} />
            {FLATS.map((f, i) => (
              <FlatShape key={i} f={f} P={P} />
            ))}
            {items}
            {ENTRANCES.map((g) => {
              // Biển cổng đặt ngoài mặt đường (sign), ghim cổng nằm bên trong khuôn viên.
              const [x, y] = P.project(g.sign[0], g.sign[1], 0);
              return (
                <g key={g.id} className={s.gate} transform={`translate(${x} ${y})`} aria-hidden="true">
                  <rect x={-30} y={-26} width={60} height={18} rx={2} />
                  <text x={0} y={-13} textAnchor="middle">
                    {g.label}
                  </text>
                  <line x1={0} y1={-8} x2={0} y2={0} />
                </g>
              );
            })}
            {visiblePois.map((p) => {
              const [x, y] = P.project(p.x, p.y, 0);
              const on = selected?.kind === 'poi' && selected.id === p.id;
              const r = on ? 13 : 10;
              return (
                <g
                  key={p.id}
                  className={s.pin}
                  transform={`translate(${x} ${y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={p.name}
                  aria-pressed={on}
                  onClick={() => !drag.current?.moved && setSelected({ kind: 'poi', id: p.id })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected({ kind: 'poi', id: p.id });
                    }
                  }}
                >
                  <ellipse cx={0} cy={0} rx={5} ry={2.2} fill="rgba(10,26,61,0.25)" />
                  <line x1={0} y1={0} x2={0} y2={-14} stroke={TYPE_COLOR[p.type]} strokeWidth={2} />
                  <circle cx={0} cy={-14 - r} r={r} fill={TYPE_COLOR[p.type]} stroke="#fff" strokeWidth={2.5} />
                  <Icon name={TYPE_ICON[p.type]} size={on ? 14 : 11} x={on ? -7 : -5.5} y={-14 - r - (on ? 7 : 5.5)} color="#fff" />
                </g>
              );
            })}
          </svg>

          <div className={s.controls}>
            <div className={s.seg} role="group" aria-label="Kiểu xem">
              <button type="button" aria-pressed={is3d} onClick={() => setTarget((v) => ({ ...v, tilt: VIEW_3D.tilt }))}>
                3D
              </button>
              <button type="button" aria-pressed={!is3d} onClick={() => setTarget((v) => ({ ...v, tilt: VIEW_2D.tilt }))}>
                2D
              </button>
            </div>
            <button type="button" className={s.ctrlBtn} aria-label="Xoay trái" onClick={() => setTarget((v) => ({ ...v, theta: Math.max(-THETA_LIMIT, v.theta - 15) }))}>
              <Icon name="arrow" size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button type="button" className={s.ctrlBtn} aria-label="Xoay phải" onClick={() => setTarget((v) => ({ ...v, theta: Math.min(THETA_LIMIT, v.theta + 15) }))}>
              <Icon name="arrow" size={16} />
            </button>
            <div className={s.seg} role="group" aria-label="Phóng to">
              <button type="button" aria-label="Thu nhỏ" disabled={zoom <= 1} onClick={() => setZoomTo(zoom - 0.6)}>
                −
              </button>
              <button type="button" aria-label="Phóng to" disabled={zoom >= ZOOM_MAX} onClick={() => setZoomTo(zoom + 0.6)}>
                +
              </button>
            </div>
            <button
              type="button"
              className={s.ctrlBtn}
              onClick={() => {
                setTarget(VIEW_3D);
                setZoomTo(1);
              }}
            >
              Đặt lại
            </button>
          </div>
          <p className={s.hint} aria-hidden="true">
            {zoom > 1 ? 'Kéo để di chuyển · bấm vào toà để xem khoa' : 'Kéo ngang để xoay · bấm vào toà để xem khoa'}
          </p>
        </div>

        <aside className={s.side}>
          <label className={s.findFaculty}>
            <span>Tìm toà của khoa</span>
            <select
              value={selBuilding?.facultyIds?.[0] ?? ''}
              onChange={(e) => {
                const b = facultyBuilding(e.target.value);
                if (b) setSelected({ kind: 'building', id: b.id });
              }}
            >
              <option value="">— Chọn khoa —</option>
              {faculties
                .filter((f) => facultyBuilding(f.id))
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
          </label>

          {selBuilding ? (
            <div className={s.detail}>
              <span className={s.detailType}>
                <span className={s.codeChip} data-hall={selBuilding.kind === 'hall' || undefined}>
                  {selBuilding.code}
                </span>
                {selBuilding.kind === 'hall' ? 'Nơi tổ chức lễ' : selBuilding.facultyIds?.length ? 'Toà của khoa' : 'Toà nhà'}
              </span>
              <h2>{selBuilding.name ?? `Toà ${selBuilding.code}`}</h2>
              {selBuilding.note ? <p>{selBuilding.note}</p> : null}
            </div>
          ) : selPoi ? (
            <div className={s.detail}>
              <span className={s.detailType} style={{ color: TYPE_COLOR[selPoi.type] }}>
                <Icon name={TYPE_ICON[selPoi.type]} size={16} /> {types[selPoi.type]}
              </span>
              <h2>{selPoi.name}</h2>
              {selPoi.note ? <p>{selPoi.note}</p> : null}
              <Button href={poiSearchUrl(selPoi)} target="_blank" rel="noreferrer" variant="secondary" size="sm" trailing={<Icon name="external" size={14} />}>
                Mở Google Maps
              </Button>
            </div>
          ) : null}

          <div className={s.filters} role="group" aria-label="Lọc điểm trên bản đồ">
            <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>
              Tất cả
            </button>
            {(Object.keys(types) as PoiType[])
              .filter((t) => t !== 'hall' && pois.some((p) => p.type === t))
              .map((t) => (
                <button type="button" key={t} aria-pressed={filter === t} onClick={() => setFilter(filter === t ? null : t)}>
                  <Icon name={TYPE_ICON[t]} size={14} /> {types[t]}
                </button>
              ))}
          </div>
          <ul className={s.list}>
            {visiblePois.map((p) => (
              <li key={p.id}>
                <button type="button" aria-pressed={selected?.kind === 'poi' && selected.id === p.id} onClick={() => setSelected({ kind: 'poi', id: p.id })}>
                  <span className={s.dot} style={{ background: TYPE_COLOR[p.type] }} aria-hidden="true" />
                  <span>{p.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

type BoxProps = {
  b: Building;
  index: number;
  faces: ReturnType<typeof boxFaces>;
  floors: number;
  hot: boolean;
  pressed: boolean;
  /** Vị trí chữ mã toà (giữa nóc, đã chiếu). */
  label: Pt;
  onHover: (id: string, on: boolean) => void;
  onPick: (id: string) => void;
};

/** Một khối của toà nhà: các tường thấy được (có vạch tầng) + nóc + mã toà. */
function BuildingBox({ b, index, faces, floors, hot, pressed, label, onHover, onPick }: BoxProps) {
  const c = hot && b.kind !== 'hall' ? HOT : KIND_COLOR[b.kind];
  const main = index === 0;
  const interactive = main && !!b.name;
  return (
    <g
      className={s.building}
      data-hot={hot || undefined}
      onPointerEnter={() => onHover(b.id, true)}
      onPointerLeave={() => onHover(b.id, false)}
      onClick={() => onPick(b.id)}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `${b.code}: ${b.name}` : undefined}
      aria-pressed={interactive ? pressed : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPick(b.id);
        }
      }}
      onFocus={() => onHover(b.id, true)}
      onBlur={() => onHover(b.id, false)}
    >
      {faces.walls.map((w) => (
        <g key={w.key}>
          <polygon points={w.points} fill={c.wall} />
          <polygon points={w.points} fill="#0a1a3d" opacity={w.shade * 0.28} />
          {Array.from({ length: Math.max(0, floors - 1) }, (_, k) => {
            const t = (k + 1) / floors;
            const a: Pt = [w.base[0][0] + (w.top[0][0] - w.base[0][0]) * t, w.base[0][1] + (w.top[0][1] - w.base[0][1]) * t];
            const z: Pt = [w.base[1][0] + (w.top[1][0] - w.base[1][0]) * t, w.base[1][1] + (w.top[1][1] - w.base[1][1]) * t];
            return <line key={k} x1={a[0]} y1={a[1]} x2={z[0]} y2={z[1]} stroke={c.line} strokeWidth={1.4} />;
          })}
        </g>
      ))}
      <polygon
        points={faces.top.points}
        fill={c.top}
        stroke={b.kind === 'hall' ? '#f4b740' : 'rgba(3,43,145,0.28)'}
        strokeWidth={b.kind === 'hall' ? 2 : 0.8}
        strokeLinejoin="round"
      />
      {main ? (
        <text x={label[0]} y={label[1] + 4} textAnchor="middle" className={s.code} fill={c.text}>
          {b.code}
        </text>
      ) : null}
    </g>
  );
}

function Street({ street, P }: { street: (typeof STREETS)[number]; P: Projector }) {
  const { x, y, angle } = street.label;
  const rad = (angle * Math.PI) / 180;
  const [ax, ay] = P.project(x, y, 0);
  const [bx, by] = P.project(x + Math.cos(rad) * 10, y + Math.sin(rad) * 10, 0);
  let deg = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  if (deg > 90) deg -= 180;
  if (deg < -90) deg += 180;
  return (
    <g aria-hidden="true">
      <polygon points={pts(street.poly.map(([px, py]) => P.project(px, py)))} className={s.street} />
      <text x={ax} y={ay} transform={`rotate(${deg.toFixed(1)} ${ax} ${ay})`} textAnchor="middle" dominantBaseline="middle" className={s.streetName}>
        {street.name}
      </text>
    </g>
  );
}

function FlatShape({ f, P }: { f: Flat; P: Projector }) {
  const rect = (x: number, y: number, w: number, d: number) => pts([P.project(x, y), P.project(x + w, y), P.project(x + w, y + d), P.project(x, y + d)]);
  const line = (x1: number, y1: number, x2: number, y2: number, key: string) => {
    const [a, b] = [P.project(x1, y1), P.project(x2, y2)];
    return <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
  };
  const { x, y, w, d } = f;
  return (
    <g className={s[`flat_${f.kind}`]} aria-hidden="true">
      <polygon points={rect(x, y, w, d)} />
      {f.kind === 'field' ? (
        <g className={s.marks}>
          <polygon points={rect(x + 6, y + 6, w - 12, d - 12)} fill="none" />
          {line(x + w / 2, y + 6, x + w / 2, y + d - 6, 'mid')}
          <polygon points={rect(x + 6, y + d / 2 - 14, 18, 28)} fill="none" />
          <polygon points={rect(x + w - 24, y + d / 2 - 14, 18, 28)} fill="none" />
        </g>
      ) : f.kind === 'court' ? (
        <g className={s.marks}>{line(x + w / 2, y + 3, x + w / 2, y + d - 3, 'net')}</g>
      ) : f.kind === 'plaza' ? (
        <g className={s.paths}>
          {line(x, y, x + w, y + d, 'd1')}
          {line(x + w, y, x, y + d, 'd2')}
          {line(x + w / 2, y, x + w / 2, y + d, 'v')}
        </g>
      ) : null}
    </g>
  );
}
