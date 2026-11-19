'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { GateButton } from '../shared/Gate';
import s from './scratch.module.css';

const BRUSH = 46;
const DONE_RATIO = 0.5;

/**
 * Lớp bạc cào được (canvas) phủ lên `children`. Cào ≥ 50% thì tự bóc hết và hiện nút Nhận giải.
 * "Cào giúp tôi" vẽ sẵn các vệt cào cho người không quen thao tác.
 */
export function ScratchCard({ children, claim }: { children: ReactNode; claim: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const paint = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    // offsetWidth: kích thước layout thật, không bị ảnh hưởng khi thiệp được thu nhỏ bằng transform (ô xem trước)
    const width = c.offsetWidth;
    const height = c.offsetHeight;
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    const g = c.getContext('2d');
    if (!g) return;
    g.scale(dpr, dpr);
    const grad = g.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#b9c0cc');
    grad.addColorStop(0.45, '#e9edf2');
    grad.addColorStop(0.55, '#c9cfd8');
    grad.addColorStop(1, '#9aa3b2');
    g.fillStyle = grad;
    g.fillRect(0, 0, width, height);
    // hoa văn tổ ong + chữ
    g.globalAlpha = 0.18;
    g.strokeStyle = '#4b5568';
    for (let y = 0; y < height + 20; y += 18) {
      for (let x = (y / 18) % 2 ? 10 : 0; x < width + 20; x += 20) {
        g.beginPath();
        g.arc(x, y, 6, 0, Math.PI * 2);
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    g.fillStyle = '#4b5568';
    g.font = `800 ${Math.max(16, Math.min(26, width / 13))}px 'Be Vietnam Pro', system-ui, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('CÀO NHẸ TẠI ĐÂY', width / 2, height / 2 - 12);
    g.font = `600 ${Math.max(12, Math.min(16, width / 22))}px 'Be Vietnam Pro', system-ui, sans-serif`;
    g.fillText('bằng ngón tay ☝', width / 2, height / 2 + 16);
  }, []);

  useEffect(() => {
    paint();
  }, [paint]);

  function ratio(): number {
    const c = canvas.current;
    const g = c?.getContext('2d');
    if (!c || !g) return 0;
    const { data } = g.getImageData(0, 0, c.width, c.height);
    let clear = 0;
    let n = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      n++;
      if (data[i] === 0) clear++;
    }
    return n ? clear / n : 0;
  }

  function finish() {
    setDone(true);
  }

  function line(x0: number, y0: number, x1: number, y1: number) {
    const g = canvas.current?.getContext('2d');
    if (!g) return;
    g.globalCompositeOperation = 'destination-out';
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = BRUSH;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
  }

  function pos(e: PointerEvent<HTMLCanvasElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const k = r.width ? el.offsetWidth / r.width : 1;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
  }
  function onDown(e: PointerEvent<HTMLCanvasElement>) {
    if (done) return;
    drawing.current = true;
    setStarted(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pos(e);
    last.current = p;
    line(p.x, p.y, p.x + 0.1, p.y + 0.1);
  }
  function onMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;
    const p = pos(e);
    line(last.current.x, last.current.y, p.x, p.y);
    last.current = p;
  }
  function onUp() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    if (ratio() >= DONE_RATIO) finish();
  }

  function auto() {
    const c = canvas.current;
    if (!c || done) return;
    setStarted(true);
    const w = c.offsetWidth;
    const h = c.offsetHeight;
    const rows = Math.ceil(h / (BRUSH * 0.7));
    const pts: [number, number][] = [];
    for (let i = 0; i <= rows; i++) {
      const y = (i / rows) * h;
      pts.push(i % 2 ? [w + 10, y] : [-10, y]);
    }
    let k = 0;
    const step = () => {
      if (k >= pts.length - 1) return finish();
      line(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]);
      k++;
      window.setTimeout(step, 70);
    };
    step();
  }

  return (
    <>
      <div className={s.scratchBox} data-done={done ? '' : undefined}>
        <div className={s.prize}>{children}</div>
        <canvas
          ref={canvas}
          className={s.foil}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label="Lớp bạc phủ giải thưởng, cào để xem"
          role="img"
        />
      </div>
      <div className={s.scratchCtl}>
        {done ? (
          <GateButton className={s.claim}>{claim}</GateButton>
        ) : (
          <button type="button" className={s.helper} onClick={auto}>
            {started ? 'Cào nốt giúp tôi' : 'Cào giúp tôi'}
          </button>
        )}
      </div>
    </>
  );
}
