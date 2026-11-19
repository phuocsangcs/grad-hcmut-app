import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS, type CampusPhoto } from '../shared/campus';
import { dateParts, firstName, paragraphs } from '../shared/date';
import { Gate, GateButton, GateSkip } from '../shared/Gate';
import { Portrait } from '../shared/Portrait';
import { sectionList, type SectionKey } from '../shared/sections';
import { SwipeDeck } from './SwipeDeck';
import s from './memories.module.css';

const YEARS: { photo: CampusPhoto; year: string; line: string }[] = [
  { photo: CAMPUS.gate, year: 'Năm nhất', line: 'Lần đầu bước qua cổng 268 Lý Thường Kiệt' },
  { photo: CAMPUS.libraryFront, year: 'Năm hai', line: 'Những mùa thi ngồi kín thư viện' },
  { photo: CAMPUS.blossomA5, year: 'Năm ba', line: 'Mùa hoa kèn nở hồng sân A5' },
  { photo: CAMPUS.b9, year: 'Năm tư', line: 'Nắng sớm B9, những đêm chạy đồ án' },
];

const SEASONS = [CAMPUS.libraryGold, CAMPUS.blossom, CAMPUS.pitch, CAMPUS.bench, CAMPUS.goldenCampus, CAMPUS.mechanical];

const SECTION_PHOTO: Record<SectionKey, CampusPhoto> = {
  gallery: CAMPUS.blossomA5,
  ceremony: CAMPUS.a5,
  rsvp: CAMPUS.libraryGold,
  guestbook: CAMPUS.blossom,
  meeting: CAMPUS.bench,
  route: CAMPUS.gate,
};

/**
 * KÝ ỨC SÂN TRƯỜNG — bìa là chồng ảnh khuôn viên thật, mỗi tấm một năm học.
 * Vuốt (hoặc bấm Tấm tiếp) để lật; tấm cuối là ảnh của bạn và nút mở thiệp.
 */
export function MemoriesTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const items = sectionList(blocks, { gallery: { title: `Ảnh của ${name}` } });

  const cards = YEARS.map((y) => (
    <figure className={s.photoCard} key={y.year}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh của mẫu */}
      <img src={y.photo.src} alt={y.photo.alt} draggable={false} />
      <figcaption>
        <b>{y.year}</b>
        <span>{y.line}</span>
      </figcaption>
    </figure>
  ));

  const last = (
    <figure className={s.photoCard} data-final="">
      <Portrait src={coverPhoto} name={card.displayName} className={s.finalPhoto} priority />
      <figcaption>
        <b>Và hôm nay</b>
        <span>
          {name} tốt nghiệp · {d.day}.{d.month}.{d.year}
        </span>
        <GateButton className={s.openBtn}>Mở thiệp mời</GateButton>
      </figcaption>
    </figure>
  );

  const cover = (
    <div className={s.coverInner}>
      <header className={s.coverHead}>
        <p className={s.kicker}>4 năm ở Bách Khoa</p>
        <h1 className={s.coverName}>{card.displayName}</h1>
        <p className={s.coverSub}>Vuốt từng tấm ảnh để đi lại bốn năm</p>
      </header>
      <SwipeDeck cards={cards} last={last} />
      <GateSkip className={s.skip} />
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={1100} exit="zoom" label="Bìa thiệp: chồng ảnh sân trường">
        <header className={s.hero}>
          <div className={s.mosaic} aria-hidden="true">
            {YEARS.map((y) => (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí
              <img key={y.year} src={y.photo.src} alt="" />
            ))}
          </div>
          <Portrait src={coverPhoto} name={card.displayName} className={s.heroPhoto} priority />
          <span className={s.chip}>{faculty.degreeTitle}</span>
          <h2 className={s.heroName}>{card.displayName}</h2>
          <p className={s.heroFaculty}>{faculty.name} · Trường Đại học Bách Khoa</p>
          <div className={s.heroDate}>
            <b>{d.day}</b>
            <span>
              Tháng {d.monthNum}
              <br />
              {d.year}
            </span>
            <i />
            <span>
              {d.weekdayLong}
              <br />
              {d.clock} · {card.venue}
            </span>
          </div>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.letter}>
            <p className={s.to}>
              {inviteLead} <b>{inviteeName}</b>
            </p>
            {paragraphs(message).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className={s.sign}>{name}</p>
          </section>

          <section className={s.seasons} aria-label="Bốn mùa sân trường">
            <h3 className={s.seasonsTitle}>Bốn mùa sân trường</h3>
            <ul className={s.seasonGrid}>
              {SEASONS.map((p) => (
                <li key={p.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh của mẫu */}
                  <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
                  <span>{p.place}</span>
                </li>
              ))}
            </ul>
          </section>

          {items.map((it) => (
            <section key={it.key} className={s.sec}>
              <div className={s.secBand} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí */}
                <img src={SECTION_PHOTO[it.key].src} alt="" loading="lazy" decoding="async" />
                <span>{it.kicker}</span>
              </div>
              <div className={s.secBody}>
                <h3 className={s.secTitle}>{it.title}</h3>
                {it.body}
              </div>
            </section>
          ))}

          {blocks.explore}
        </div>
      </Gate>
    </main>
  );
}
