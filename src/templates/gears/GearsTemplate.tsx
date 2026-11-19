import type { CSSProperties } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, firstName, paragraphs } from '../shared/date';
import { Gate } from '../shared/Gate';
import { sectionList } from '../shared/sections';
import { HoldCrank } from './HoldCrank';
import s from './gears.module.css';

/** Đường viền bánh răng: `teeth` răng hình thang quanh tâm (0,0). */
function gearPath(teeth: number, rOut: number, rIn: number): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const corners = [
      [rIn, a],
      [rOut, a + step * 0.15],
      [rOut, a + step * 0.45],
      [rIn, a + step * 0.6],
    ];
    for (const [r, t] of corners) pts.push(`${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

const GEARS = [
  { x: 150, y: 150, teeth: 16, r: 92, dir: 1, ratio: 1, fill: 'var(--steel-dark)', label: true },
  { x: 282, y: 92, teeth: 10, r: 58, dir: -1, ratio: 1.6, fill: 'var(--brass)' },
  { x: 276, y: 236, teeth: 8, r: 46, dir: -1, ratio: 2, fill: 'var(--steel)' },
];

function GearSet({ year }: { year: string }) {
  return (
    <svg className={s.gears} viewBox="0 0 340 300" aria-hidden="true">
      {GEARS.map((g, i) => (
        <g key={i} transform={`translate(${g.x} ${g.y})`}>
          <g className={s.gear} style={{ '--dir': g.dir, '--ratio': g.ratio } as CSSProperties}>
            <path d={gearPath(g.teeth, g.r, g.r - 13)} fill={g.fill} />
            <circle r={g.r - 26} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <circle key={k} r={g.r * 0.09} cx={Math.cos((k * Math.PI) / 3) * g.r * 0.5} cy={Math.sin((k * Math.PI) / 3) * g.r * 0.5} fill="rgba(0,0,0,0.25)" />
            ))}
            <circle r={g.r * 0.18} fill="#e9edf3" stroke="#59627a" strokeWidth="3" />
          </g>
          {g.label ? (
            <text className={s.gearText} y="6" textAnchor="middle">
              {year}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

function Gauge() {
  return (
    <div className={s.gauge} aria-hidden="true">
      <svg viewBox="0 0 120 80">
        <path d="M12 70a48 48 0 0 1 96 0" fill="none" stroke="#c9ced8" strokeWidth="8" strokeLinecap="round" />
        <path d="M12 70a48 48 0 0 1 96 0" fill="none" stroke="var(--brass)" strokeWidth="8" strokeLinecap="round" pathLength={1} className={s.gaugeFill} />
        <g className={s.needle}>
          <path d="M60 70 60 28" stroke="#d7263d" strokeWidth="3.5" strokeLinecap="round" />
        </g>
        <circle cx="60" cy="70" r="6" fill="#1d2340" />
      </svg>
      <ol className={s.years}>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ol>
      <p className={s.yearsCap}>năm học</p>
    </div>
  );
}

/**
 * BÁNH RĂNG — tấm thép đinh tán, ba bánh răng khớp nhau và đồng hồ áp suất.
 * Nhấn giữ: bánh răng quay, kim lên dần qua Năm 1…4; đủ thì cửa cuốn kéo lên lộ thiệp.
 */
export function GearsTemplate({ card, faculty, blocks, message, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const items = sectionList(blocks, {
    ceremony: { kicker: 'Lịch vận hành' },
    rsvp: { kicker: 'Xác nhận nghiệm thu' },
    meeting: { kicker: 'Điểm tập kết' },
  });

  const cover = (
    <div className={s.plate}>
      <span className={s.rivets} aria-hidden="true" />
      <header className={s.tag}>
        <p>Xưởng Cơ khí Bách Khoa · Phiếu gia công</p>
        <h1 className={s.coverName}>{card.displayName}</h1>
        <p className={s.coverSub}>
          {faculty.degreeTitle} · {d.weekdayShort} {d.day}.{d.month}.{d.year} · {d.clock}
        </p>
      </header>
      <HoldCrank>
        <div className={s.machine}>
          <GearSet year={d.year} />
          <Gauge />
        </div>
      </HoldCrank>
      <p className={s.coverTo}>
        {inviteLead} <b>{inviteeName}</b> · giữ nút để khớp bánh răng cuối cùng
      </p>
      <span className={s.shutter} aria-hidden="true" />
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={900} exit="up" label="Bìa thiệp: bánh răng">
        <header className={s.hero}>
          <div className={s.nameplate}>
            <span className={s.rivets} aria-hidden="true" />
            <p className={s.npKicker}>Sản phẩm hoàn thiện · Lô {d.year}</p>
            <h2 className={s.npName}>{card.displayName}</h2>
            <p className={s.npDeg}>
              {faculty.degreeTitle} · {faculty.name}
            </p>
            <dl className={s.spec}>
              <div>
                <dt>Vật liệu</dt>
                <dd>4 năm kiên trì</dd>
              </div>
              <div>
                <dt>Dung sai</dt>
                <dd>± 0 môn nợ</dd>
              </div>
              <div>
                <dt>Kiểm định</dt>
                <dd>Đạt ✓</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.sheet}>
            <span className={s.rivets} aria-hidden="true" />
            <p className={s.stamp}>Phiếu 00 · Thư mời</p>
            <p className={s.to}>
              {inviteLead} <b>{inviteeName}</b>,
            </p>
            {paragraphs(message).map((p, i) => (
              <p key={i} className={s.text}>
                {p}
              </p>
            ))}
            <p className={s.sign}>— {name}</p>
          </section>

          <figure className={s.photo}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh của mẫu */}
            <img src={CAMPUS.mechanical.src} alt={CAMPUS.mechanical.alt} loading="lazy" decoding="async" />
            <figcaption>{CAMPUS.mechanical.place} · nơi bánh răng đầu tiên bắt đầu quay</figcaption>
          </figure>

          {items.map((it, i) => (
            <section key={it.key} className={s.sheet}>
              <span className={s.rivets} aria-hidden="true" />
              <p className={s.stamp}>
                Phiếu {String(i + 1).padStart(2, '0')} · {it.kicker}
              </p>
              <h3 className={s.secTitle}>{it.title}</h3>
              {it.body}
            </section>
          ))}

          <div className={s.sheet}>{blocks.explore}</div>
        </div>
      </Gate>
    </main>
  );
}
