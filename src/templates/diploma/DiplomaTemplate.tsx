import Image from 'next/image';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, paragraphs, shortName } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { Portrait } from '../shared/Portrait';
import { sectionList } from '../shared/sections';
import s from './diploma.module.css';

/** Hoa văn góc khung giấy mời (vẽ một lần, xoay cho 4 góc). */
function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <svg className={s.corner} data-pos={pos} viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 56V18C4 10 10 4 18 4h38" />
      <path d="M12 56V24c0-7 5-12 12-12h32" />
      <path d="M20 20c6 0 10 4 10 10-6 0-10-4-10-10zM30 30c0-6 4-10 10-10 0 6-4 10-10 10z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

/** Huy chương niêm vàng có dải lụa. */
function Rosette({ year }: { year: string }) {
  return (
    <span className={s.rosette} aria-hidden="true">
      <span className={s.tailL} />
      <span className={s.tailR} />
      <span className={s.medal}>
        <small>Bách Khoa</small>
        <b>{year}</b>
      </span>
    </span>
  );
}

/**
 * CUỘN BẰNG — bìa là cuộn giấy buộc nơ vàng trên nền nhung xanh.
 * Chạm nơ: nơ rơi, cuộn giấy trải dọc ra, lộ Giấy mời viền hoa văn, dấu niêm và ảnh thư viện in chìm.
 */
export function DiplomaTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const items = sectionList(blocks);

  const cover = (
    <div className={s.coverInner}>
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
      <p className={s.kicker}>Lễ tốt nghiệp · {d.year}</p>
      <h1 className={s.coverTitle}>
        Một tấm bằng
        <em>gửi {inviteeName}</em>
      </h1>

      <div className={s.scroll}>
        <span className={s.roll} data-roll="top" aria-hidden="true" />
        <span className={s.sheet} aria-hidden="true">
          <b>Giấy mời</b>
          <i />
          <i />
          <i />
        </span>
        <span className={s.roll} data-roll="bottom" aria-hidden="true" />
        <GateButton className={s.bow} ariaLabel="Tháo nơ, mở cuộn bằng">
          <span className={s.bowBand} />
          <span className={s.bowLoop} data-side="l" />
          <span className={s.bowLoop} data-side="r" />
          <span className={s.bowKnot} />
        </GateButton>
      </div>

      <div className={s.coverMeta}>
        <b>{card.displayName}</b>
        <span>
          {faculty.degreeTitle} · {faculty.shortName}
        </span>
        <span>
          {d.weekdayShort} · {d.day}.{d.month}.{d.year} · {d.clock} · {card.venue}
        </span>
      </div>
      <GateButton className={s.cta}>Tháo nơ · Mở cuộn bằng</GateButton>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={2000} exit="fade" label="Bìa thiệp: cuộn bằng">
        <div className={s.body}>
          <article className={s.cert}>
            <div className={s.watermark} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh in chìm trang trí */}
              <img src={CAMPUS.libraryFront.src} alt="" />
            </div>
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
            <Image src="/images/site/logo-bk.png" alt="Logo Trường Đại học Bách Khoa" width={200} height={191} className={s.logo} />
            <p className={s.school}>
              Trường Đại học Bách Khoa
              <br />
              <span>Đại học Quốc gia TP. Hồ Chí Minh</span>
            </p>
            <h2 className={s.certTitle}>Giấy mời</h2>
            <p className={s.line}>{inviteLead}</p>
            <p className={s.certTo}>{inviteeName}</p>
            <p className={s.line}>đến dự lễ tốt nghiệp của {faculty.degreeTitle}</p>
            <p className={s.certName}>{card.displayName}</p>
            <p className={s.line}>{faculty.name}</p>
            <div className={s.certFoot}>
              <div>
                <span>Thời gian</span>
                <b>
                  {d.clock} · {d.day}.{d.month}.{d.year}
                </b>
              </div>
              <Rosette year={d.year} />
              <div>
                <span>Địa điểm</span>
                <b>{card.venue}</b>
              </div>
            </div>
          </article>

          {blocks.after}

          <section className={s.note}>
            <Portrait src={coverPhoto} name={card.displayName} className={s.oval} priority />
            <div className={s.noteText}>
              <p className={s.ribbonLabel}>Đôi lời</p>
              {paragraphs(message).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className={s.sign}>{shortName(card.displayName)}</p>
            </div>
          </section>

          {items.map((it) => (
            <section key={it.key} className={s.sec}>
              <p className={s.ribbonLabel}>{it.kicker}</p>
              <h3 className={s.secTitle}>{it.title}</h3>
              {it.body}
            </section>
          ))}

          <div className={s.explore}>{blocks.explore}</div>
        </div>
      </Gate>
    </main>
  );
}
