import Image from 'next/image';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, paragraphs, shortName } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { Portrait } from '../shared/Portrait';
import { sectionList } from '../shared/sections';
import s from './gate.module.css';

const PLACES = [CAMPUS.libraryFront, CAMPUS.blossomA5, CAMPUS.b9, CAMPUS.libraryGold, CAMPUS.pitch, CAMPUS.bench];

/** Một cánh cổng: nửa trái/phải của cùng một ảnh, ghép khít ở giữa. */
function Door({ side }: { side: 'l' | 'r' }) {
  return (
    <div className={s.door} data-side={side}>
      <div className={s.doorImg}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí */}
        <img src={CAMPUS.gate.src} alt="" fetchPriority="high" />
      </div>
      <span className={s.doorEdge} />
    </div>
  );
}

/**
 * CỔNG TRƯỜNG — bìa là ảnh cổng 268 Lý Thường Kiệt tách làm hai cánh.
 * Bấm "Mở cổng trường": chữ mờ đi, hai cánh xoay mở ra, phía sau là sân A5 và thư mời.
 */
export function GateTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const items = sectionList(blocks);

  const cover = (
    <>
      <div className={s.doors} aria-hidden="true">
        <Door side="l" />
        <Door side="r" />
      </div>
      <div className={s.coverInner}>
        <span className={s.crest}>
          <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} />
        </span>
        <p className={s.kicker}>Thiệp mời tốt nghiệp · {d.year}</p>
        <h1 className={s.coverName}>{card.displayName}</h1>
        <p className={s.coverDegree}>
          {faculty.degreeTitle} · {faculty.name}
        </p>
        <div className={s.plate}>
          <b>
            {d.weekdayShort} · {d.day}.{d.month}.{d.year} · {d.clock}
          </b>
          <span>{card.venue}</span>
        </div>
        <p className={s.coverTo}>
          {inviteLead} <b>{inviteeName}</b>
        </p>
        <GateButton className={s.cta}>
          <svg className={s.ctaKey} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="7.5" cy="15.5" r="4.5" />
            <path d="M10.7 12.3 20 3M16 7l3 3M14 9l2 2" />
          </svg>
          Mở cổng trường
        </GateButton>
        <p className={s.address}>Cổng chính · 268 Lý Thường Kiệt</p>
      </div>
    </>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={1700} exit="none" label="Bìa thiệp: cổng trường">
        <header className={s.hero}>
          <div className={s.heroPhoto} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí */}
            <img src={CAMPUS.a5.src} alt="" />
          </div>
          <div className={s.heroCard}>
            <Portrait src={coverPhoto} name={card.displayName} className={s.portrait} priority />
            <span className={s.chip}>{faculty.degreeTitle}</span>
            <h2 className={s.heroName}>{card.displayName}</h2>
            <p className={s.tagline}>“{faculty.tagline}”</p>
            <dl className={s.facts}>
              <div>
                <dt>{faculty.kind === 'faculty' ? 'Khoa' : 'Chương trình'}</dt>
                <dd>{faculty.shortName}</dd>
              </div>
              <div>
                <dt>Ngày</dt>
                <dd>
                  {d.day}.{d.month}
                </dd>
              </div>
              <div>
                <dt>Giờ</dt>
                <dd>{d.clock}</dd>
              </div>
            </dl>
            <p className={s.heroTo}>
              <span>{inviteLead}</span>
              <b>{inviteeName}</b>
            </p>
          </div>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.letter}>
            <p className={s.secKicker}>Lời mời</p>
            {paragraphs(message).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className={s.sign}>— {shortName(card.displayName)}</p>
          </section>

          {items.map((it, i) => (
            <section key={it.key} className={s.sec}>
              <header className={s.secHead}>
                <span className={s.num}>{String(i + 1).padStart(2, '0')}</span>
                <span className={s.secKicker}>{it.kicker}</span>
              </header>
              <h3 className={s.secTitle}>{it.title}</h3>
              {it.body}
            </section>
          ))}

          <section className={s.places} aria-label="Góc trường">
            <h3 className={s.placesTitle}>Góc trường chờ cả nhà ghé</h3>
            <p className={s.placesHint}>Vuốt ngang để xem</p>
            <ul className={s.placesRow}>
              {PLACES.map((p) => (
                <li key={p.src} className={s.place}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh của mẫu */}
                  <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
                  <span>{p.place}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className={s.footSign}>
            Bách Khoa · {d.year} · {shortName(card.displayName)}
          </p>
          {blocks.explore}
        </div>
      </Gate>
    </main>
  );
}
