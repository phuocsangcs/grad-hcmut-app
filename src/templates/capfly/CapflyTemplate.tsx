import type { CSSProperties } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, firstName, paragraphs } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { Portrait } from '../shared/Portrait';
import { sectionList } from '../shared/sections';
import { Cap } from './Cap';
import { CapToss } from './CapToss';
import s from './capfly.module.css';

/** Mũ phụ bay theo khi tung: vị trí ngang, độ trễ, góc xoay. */
const CREW = [
  { x: '12%', d: '120ms', r: '-540deg', z: 0.55 },
  { x: '78%', d: '60ms', r: '600deg', z: 0.7 },
  { x: '30%', d: '260ms', r: '420deg', z: 0.45 },
  { x: '62%', d: '200ms', r: '-480deg', z: 0.5 },
  { x: '88%', d: '320ms', r: '380deg', z: 0.4 },
  { x: '4%', d: '380ms', r: '-400deg', z: 0.5 },
];
const PAPER = Array.from({ length: 22 }, (_, i) => ({
  '--x': `${(i * 41) % 100}%`,
  '--d': `${(i % 8) * 70}ms`,
  '--c': ['#f4b740', '#1488db', '#f3a6be', '#ffffff', '#1f9d68'][i % 5],
  '--r': `${(i * 83) % 360}deg`,
}));

/**
 * TUNG MŨ — bầu trời sáng, chiếc mũ cử nhân chờ được tung.
 * Chạm mũ: mũ xoay vút lên, cả đàn mũ bay theo, pháo giấy rơi; bìa trượt lên.
 * Bên trong: chạm vào bầu trời ở đầu thiệp để tung thêm mũ.
 */
export function CapflyTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const items = sectionList(blocks);

  const cover = (
    <div className={s.sky}>
      <span className={s.sun} aria-hidden="true" />
      <span className={s.cloud} data-n="1" aria-hidden="true" />
      <span className={s.cloud} data-n="2" aria-hidden="true" />
      <span className={s.cloud} data-n="3" aria-hidden="true" />

      <header className={s.coverHead}>
        <p className={s.kicker}>Class of {d.year} · Bách Khoa</p>
        <h1 className={s.coverTitle}>
          Tung mũ
          <br />
          thôi {inviteeName}!
        </h1>
        <p className={s.coverName}>
          {card.displayName} tốt nghiệp rồi
        </p>
        <p className={s.coverWhen}>
          {d.weekdayShort} · {d.day}.{d.month} · {d.clock} · {card.venue}
        </p>
      </header>

      <div className={s.launch}>
        {CREW.map((c, i) => (
          <span key={i} className={s.crew} style={{ left: c.x, '--d': c.d, '--r': c.r, '--z': c.z } as CSSProperties} aria-hidden="true">
            <Cap />
          </span>
        ))}
        <GateButton className={s.bigCap} ariaLabel="Tung mũ, mở thiệp">
          <Cap className={s.bigCapSvg} />
        </GateButton>
        <p className={s.hint}>
          <span aria-hidden="true">☝</span> Chạm vào mũ để tung
        </p>
      </div>

      <div className={s.paper} aria-hidden="true">
        {PAPER.map((p, i) => (
          <i key={i} style={p as CSSProperties} />
        ))}
      </div>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={1700} exit="up" label="Bìa thiệp: tung mũ">
        <CapToss className={s.hero}>
          <span className={s.cloud} data-n="1" aria-hidden="true" />
          <span className={s.cloud} data-n="3" aria-hidden="true" />
          <div className={s.heroField} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí */}
            <img src={CAMPUS.pitch.src} alt="" />
          </div>
          <Portrait src={coverPhoto} name={card.displayName} className={s.heroPhoto} priority />
          <span className={s.chip}>{faculty.degreeTitle}</span>
          <h2 className={s.heroName}>{card.displayName}</h2>
          <p className={s.heroFaculty}>{faculty.name}</p>
        </CapToss>

        <div className={s.body}>
          {blocks.after}

          <section className={s.letter}>
            <Cap className={s.letterCap} />
            <p className={s.to}>
              {inviteLead} <b>{inviteeName}</b>
            </p>
            {paragraphs(message).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className={s.sign}>— {name}</p>
          </section>

          {items.map((it) => (
            <section key={it.key} className={s.sec}>
              <p className={s.secKicker}>
                <Cap className={s.secCap} /> {it.kicker}
              </p>
              <h3 className={s.secTitle}>{it.title}</h3>
              {it.body}
            </section>
          ))}

          {blocks.explore}
        </div>
      </Gate>
    </main>
  );
}
