import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, paragraphs, shortName } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { Portrait } from '../shared/Portrait';
import { sectionList } from '../shared/sections';
import s from './stage.module.css';

const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180;
  const r = 90 + ((i * 53) % 160);
  return {
    '--x': `${Math.round(Math.cos(a) * r)}px`,
    '--y': `${Math.round(Math.sin(a) * r * 0.9 + 140)}px`,
    '--r': `${(i * 67) % 360}deg`,
    '--d': `${(i % 7) * 40}ms`,
    '--c': ['#f4b740', '#ffffff', '#1488db', '#f3a6be', '#ffe3a3'][i % 5],
  } as CSSProperties;
});

/**
 * SÂN KHẤU LỄ — màn nhung xanh BK, đèn rọi giữa sân khấu.
 * Bấm Kéo màn: màn dồn về hai bên, pháo giấy bung, lộ ảnh sân trường và tên bạn. Bên trong là tờ chương trình.
 */
export function StageTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const items = sectionList(blocks, { ceremony: { kicker: 'Tiết mục chính' } });
  const program = [
    { time: card.beforeTime ?? 'Trước giờ lễ', label: 'Đón khách, chụp ảnh ở sân trường' },
    { time: d.clock, label: `Lễ trao bằng tại ${card.venue}`, main: true },
    { time: card.meeting?.time ?? card.afterTime ?? 'Sau lễ', label: card.meeting ? `Gặp nhau ở ${card.meeting.poi.name}` : 'Chụp ảnh cùng gia đình' },
  ];

  const cover = (
    <div className={s.stage}>
      <div className={s.backdrop} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí */}
        <img src={CAMPUS.goldenCampus.src} alt="" fetchPriority="high" />
      </div>
      <div className={s.reveal} aria-hidden="true">
        <span>Xin một tràng pháo tay cho</span>
        <b>{card.displayName}</b>
      </div>
      <span className={s.curtain} data-side="l" aria-hidden="true" />
      <span className={s.curtain} data-side="r" aria-hidden="true" />
      <div className={s.valance} aria-hidden="true">
        <span>Lễ tốt nghiệp · {d.year}</span>
      </div>
      <span className={s.spot} aria-hidden="true" />

      <div className={s.marquee}>
        <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} className={s.marqueeLogo} />
        <p className={s.present}>Sân khấu Bách Khoa xin giới thiệu</p>
        <h1 className={s.coverName}>{card.displayName}</h1>
        <p className={s.coverRole}>
          trong vai <b>{faculty.degreeTitle}</b>
        </p>
        <p className={s.coverWhen}>
          {d.weekdayShort} · {d.day}.{d.month}.{d.year} · {d.clock}
          <br />
          {card.venue}
        </p>
        <p className={s.coverTo}>
          {inviteLead} <b>{inviteeName}</b>
        </p>
        <GateButton className={s.cta}>
          <span aria-hidden="true">✦</span> Kéo màn <span aria-hidden="true">✦</span>
        </GateButton>
      </div>
      <div className={s.confetti} aria-hidden="true">
        {CONFETTI.map((st, i) => (
          <i key={i} style={st} />
        ))}
      </div>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={2200} exit="fade" label="Bìa thiệp: sân khấu">
        <header className={s.hero}>
          <div className={s.heroBg} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí */}
            <img src={CAMPUS.goldenCampus.src} alt="" />
          </div>
          <p className={s.heroKicker}>Ngôi sao của buổi lễ</p>
          <Portrait src={coverPhoto} name={card.displayName} className={s.heroPhoto} priority />
          <h2 className={s.heroName}>{card.displayName}</h2>
          <p className={s.heroRole}>
            {faculty.degreeTitle} · {faculty.name}
          </p>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.program}>
            <h3 className={s.programTitle}>Chương trình</h3>
            <ol className={s.programList}>
              {program.map((p) => (
                <li key={p.label} data-main={p.main ? '' : undefined}>
                  <b>{p.time}</b>
                  <span>{p.label}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className={s.letter}>
            <p className={s.to}>
              {inviteLead} <b>{inviteeName}</b>
            </p>
            {paragraphs(message).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className={s.sign}>{shortName(card.displayName)}</p>
          </section>

          {items.map((it, i) => (
            <section key={it.key} className={s.sec}>
              <header className={s.secHead}>
                <span>Màn {i + 1}</span>
                <b>{it.kicker}</b>
              </header>
              <h3 className={s.secTitle}>{it.title}</h3>
              {it.body}
            </section>
          ))}

          <p className={s.bow}>— Hết màn · Cảm ơn khán giả —</p>
          <div className={s.explore}>{blocks.explore}</div>
        </div>
      </Gate>
    </main>
  );
}
