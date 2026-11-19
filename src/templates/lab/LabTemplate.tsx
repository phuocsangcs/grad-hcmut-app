import type { CSSProperties } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, firstName, initials, paragraphs } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { sectionList } from '../shared/sections';
import s from './lab.module.css';

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({ '--x': `${150 + ((i * 23) % 60) - 30}px`, '--d': `${(i % 6) * 120}ms`, '--s': `${3 + (i % 4)}px` }));

function Bench() {
  return (
    <svg className={s.bench} viewBox="0 0 300 300" aria-hidden="true">
      {/* bình tam giác */}
      <defs>
        <clipPath id="lab-flask">
          <path d="M128 110v52L88 250c-4 10 2 18 12 18h100c10 0 16-8 12-18l-40-88v-52z" />
        </clipPath>
      </defs>
      <g clipPath="url(#lab-flask)">
        <rect x="80" y="200" width="140" height="150" className={s.liquid} />
        {BUBBLES.map((b, i) => (
          <circle key={i} cx="0" cy="262" r="4" className={s.bubble} style={b as CSSProperties} />
        ))}
      </g>
      <path d="M128 110v52L88 250c-4 10 2 18 12 18h100c10 0 16-8 12-18l-40-88v-52" className={s.glass} />
      <path d="M122 110h56" className={s.glass} />
      <path d="M104 236h92M112 218h76" className={s.marks} />
      {/* dòng đổ */}
      <rect x="147" y="70" width="6" height="0" rx="3" className={s.stream} />
      {/* ống nghiệm */}
      <g className={s.tube}>
        <rect x="222" y="40" width="26" height="120" rx="13" className={s.tubeLiquidBg} />
        <rect x="222" y="96" width="26" height="64" rx="13" className={s.tubeLiquid} />
        <rect x="222" y="40" width="26" height="120" rx="13" className={s.glass} />
        <path d="M216 40h38" className={s.glass} />
      </g>
      {/* lấp lánh */}
      {[
        [96, 96],
        [210, 110],
        [150, 52],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 10}v20M${x - 10} ${y}h20`} className={s.spark} style={{ '--d': `${i * 120}ms` } as CSSProperties} />
      ))}
    </svg>
  );
}

/**
 * PHẢN ỨNG HOÀN TẤT — bàn thí nghiệm sáng: ống nghiệm vàng và bình xanh.
 * Chạm ống nghiệm: ống nghiêng đổ vào bình, dung dịch dâng lên, đổi màu, sủi bọt, lấp lánh,
 * phương trình "Sinh viên + 4 năm → ?" ra kết quả. Bên trong: tên thành ô nguyên tố, sổ thí nghiệm giấy kẻ ô.
 */
export function LabTemplate({ card, faculty, blocks, message, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const ini = initials(card.displayName);
  const symbol = ini.length > 1 ? ini[0] + ini.slice(1).toLowerCase() : ini;
  const items = sectionList(blocks, {
    ceremony: { kicker: 'Điều kiện phản ứng' },
    rsvp: { kicker: 'Chất xúc tác' , title: 'Có bạn, phản ứng mới trọn vẹn' },
    meeting: { kicker: 'Nơi thu sản phẩm' },
  });

  const cover = (
    <div className={s.lab}>
      <p className={s.kicker}>Phòng thí nghiệm Bách Khoa · Mẫu {d.year}</p>
      <p className={s.eq}>
        <span>Sinh viên</span> + <span>4 năm</span>
        <span className={s.arrow}>
          <small>Δ BK</small>→
        </span>
        <b className={s.product}>
          <i className={s.q}>?</i>
          <i className={s.a}>{faculty.degreeTitle}</i>
        </b>
      </p>
      <GateButton className={s.pour} ariaLabel="Đổ ống nghiệm, bắt đầu phản ứng">
        <Bench />
      </GateButton>
      <p className={s.hint}>
        <span aria-hidden="true">⚗</span> Chạm ống nghiệm để đổ vào bình
      </p>
      <div className={s.label}>
        <b>{card.displayName}</b>
        <span>
          {faculty.name} · {d.weekdayShort} {d.day}.{d.month}.{d.year} · {d.clock} · {card.venue}
        </span>
        <span>
          {inviteLead} <b>{inviteeName}</b>
        </span>
      </div>
      <p className={s.done}>Phản ứng hoàn tất!</p>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={2600} exit="fade" label="Bìa thiệp: phòng thí nghiệm">
        <header className={s.hero}>
          <div className={s.element}>
            <span className={s.elNum}>{d.day}</span>
            <span className={s.elMass}>4,00 năm</span>
            <b className={s.elSym}>{symbol}</b>
            <span className={s.elName}>{card.displayName}</span>
          </div>
          <div className={s.heroText}>
            <p className={s.heroKicker}>Nguyên tố mới được tìm thấy</p>
            <h1 className={s.heroName}>{card.displayName}</h1>
            <p className={s.heroDeg}>
              {faculty.degreeTitle} · {faculty.name}
            </p>
            <p className={s.tagline}>“{faculty.tagline}”</p>
          </div>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.note}>
            <p className={s.noteHead}>
              <span>Thí nghiệm 00</span> Thư mời
            </p>
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
            <img src={CAMPUS.sprinkler.src} alt={CAMPUS.sprinkler.alt} loading="lazy" decoding="async" />
            <figcaption>H₂O · {CAMPUS.sprinkler.place} ở sân trường</figcaption>
          </figure>

          {items.map((it, i) => (
            <section key={it.key} className={s.note}>
              <p className={s.noteHead}>
                <span>Thí nghiệm {String(i + 1).padStart(2, '0')}</span> {it.kicker}
              </p>
              <h2 className={s.noteTitle}>{it.title}</h2>
              {it.body}
            </section>
          ))}

          <div className={s.note}>{blocks.explore}</div>
        </div>
      </Gate>
    </main>
  );
}
