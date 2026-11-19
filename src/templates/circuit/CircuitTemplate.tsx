import type { CSSProperties } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, firstName, paragraphs } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { sectionList } from '../shared/sections';
import s from './circuit.module.css';

const TRACES = [
  'M180 300V200',
  'M150 120V96H60V48',
  'M165 120V76H120V48',
  'M180 120V48',
  'M195 120V76H240V48',
  'M210 120V96H300V48',
  'M150 140H110V180H30',
  'M150 180H120V230H60V300',
  'M210 140H250V180H330',
  'M210 180H240V230H300V300',
];
const LEDS = [60, 120, 180, 240, 300];
const LED_COLORS = ['#ff5c8a', '#f4b740', '#35c9ff', '#7cf29a', '#ffffff'];

function Board({ year }: { year: string }) {
  return (
    <svg className={s.board} viewBox="0 0 360 310" aria-hidden="true">
      <g className={s.tracesDim}>
        {TRACES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className={s.tracesLive}>
        {TRACES.map((d, i) => (
          <path key={d} d={d} pathLength={1} style={{ '--i': i } as CSSProperties} />
        ))}
      </g>
      {/* pad hàn */}
      {[
        [30, 180],
        [60, 300],
        [330, 180],
        [300, 300],
        [180, 300],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="7" className={s.pad} />
      ))}
      {/* chip */}
      <g className={s.chip}>
        {[128, 146, 164, 182].map((y) => (
          <g key={y}>
            <rect x="140" y={y} width="10" height="5" />
            <rect x="210" y={y} width="10" height="5" />
          </g>
        ))}
        <rect x="150" y="120" width="60" height="80" rx="4" className={s.chipBody} />
        <circle cx="160" cy="130" r="3" className={s.chipDot} />
        <text x="180" y="158" textAnchor="middle">
          BK
        </text>
        <text x="180" y="176" textAnchor="middle" className={s.chipYear}>
          {year}
        </text>
      </g>
      {/* điện trở */}
      <path d="M85 96h6l3-6 6 12 6-12 6 12 3-6h6" className={s.resistor} />
      <path d="M254 96h6l3-6 6 12 6-12 6 12 3-6h6" className={s.resistor} />
      {/* LED */}
      {LEDS.map((x, i) => (
        <g key={x} className={s.led} style={{ '--i': i, '--c': LED_COLORS[i] } as CSSProperties}>
          <circle cx={x} cy="34" r="16" className={s.ledGlow} />
          <circle cx={x} cy="34" r="10" className={s.ledBody} />
        </g>
      ))}
    </svg>
  );
}

/**
 * THÔNG MẠCH — bo mạch xanh đậm, đường mạch vàng đồng.
 * Bật công tắc: dòng điện chạy dọc đường mạch, 5 đèn LED sáng lần lượt, màn hình báo MẠCH ĐÃ THÔNG.
 * Bên trong mỗi mục là một "chip" U1, U2… có chân cắm hai bên.
 */
export function CircuitTemplate({ card, faculty, blocks, message, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const items = sectionList(blocks, {
    ceremony: { kicker: 'Nguồn chính', title: 'Lễ trao bằng tốt nghiệp' },
    rsvp: { kicker: 'Tín hiệu phản hồi' },
    route: { kicker: 'Đường dẫn' },
  });

  const cover = (
    <div className={s.pcb}>
      <p className={s.rev}>
        PCB tốt nghiệp · Rev {d.year} · {faculty.shortName}
      </p>
      <div className={s.oled}>
        <span className={s.oledOff}>Mạch hở · chờ đóng công tắc</span>
        <span className={s.oledOn}>Mạch đã thông ✓</span>
        <b>{card.displayName}</b>
        <small>
          {faculty.degreeTitle} · {d.day}.{d.month}.{d.year} · {d.clock}
        </small>
      </div>
      <Board year={d.year} />
      <p className={s.coverTo}>
        {inviteLead} <b>{inviteeName}</b>
      </p>
      <GateButton className={s.switch} ariaLabel="Bật công tắc, mở thiệp">
        <span className={s.switchLabel} data-v="off">
          Tắt
        </span>
        <span className={s.switchKnob} aria-hidden="true" />
        <span className={s.switchLabel} data-v="on">
          Bật
        </span>
      </GateButton>
      <p className={s.hint}>Bật công tắc để cấp điện cho thiệp</p>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={2500} exit="fade" label="Bìa thiệp: bo mạch">
        <header className={s.hero}>
          <p className={s.rev}>Datasheet · {faculty.name}</p>
          <div className={s.oled} data-on="">
            <span className={s.oledOn}>Đèn đã sáng</span>
            <b>{card.displayName}</b>
            <small>{faculty.degreeTitle}</small>
          </div>
          <p className={s.tagline}>“{faculty.tagline}”</p>
          <dl className={s.spec}>
            <div>
              <dt>Ngày</dt>
              <dd>
                {d.day}.{d.month}.{d.year}
              </dd>
            </div>
            <div>
              <dt>Giờ</dt>
              <dd>{d.clock}</dd>
            </div>
            <div>
              <dt>Nơi</dt>
              <dd>{card.venue}</dd>
            </div>
          </dl>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.module}>
            <header className={s.modHead}>
              <b>U0</b>
              <span>Thư mời</span>
            </header>
            <div className={s.modBody}>
              <p className={s.to}>
                {inviteLead} <b>{inviteeName}</b>,
              </p>
              {paragraphs(message).map((p, i) => (
                <p key={i} className={s.text}>
                  {p}
                </p>
              ))}
              <p className={s.sign}>— {name}</p>
            </div>
          </section>

          <figure className={s.probe}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh của mẫu */}
            <img src={CAMPUS.a5.src} alt={CAMPUS.a5.alt} loading="lazy" decoding="async" />
            <figcaption>
              <b>TP1</b> Điểm đo chính · {CAMPUS.a5.place}
            </figcaption>
          </figure>

          {items.map((it, i) => (
            <section key={it.key} className={s.module}>
              <header className={s.modHead}>
                <b>U{i + 1}</b>
                <span>{it.kicker}</span>
              </header>
              <div className={s.modBody}>
                <h2 className={s.modTitle}>{it.title}</h2>
                {it.body}
              </div>
            </section>
          ))}

          <div className={s.module}>
            <div className={s.modBody}>{blocks.explore}</div>
          </div>
        </div>
      </Gate>
    </main>
  );
}
