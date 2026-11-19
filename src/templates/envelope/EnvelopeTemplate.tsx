import Image from 'next/image';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, paragraphs, shortName } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { Portrait } from '../shared/Portrait';
import { sectionList } from '../shared/sections';
import s from './envelope.module.css';

/**
 * THƯ MỜI BÁCH KHOA — phong bì kem, tem ảnh thư viện, dấu bưu điện ngày lễ, sáp niêm vàng in logo.
 * Chạm con dấu: sáp vỡ → nắp thư lật lên → lá thư trượt ra → mở thư mời có tiêu đề Trường.
 */
export function EnvelopeTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const items = sectionList(blocks);

  const cover = (
    <div className={s.coverInner}>
      <p className={s.kicker}>Bạn có một lá thư từ Bách Khoa</p>
      <h1 className={s.coverTitle}>
        Thư mời
        <em>dự lễ tốt nghiệp {d.year}</em>
      </h1>

      <div className={s.envelope}>
        <div className={s.back} aria-hidden="true" />
        <div className={s.peek} aria-hidden="true">
          <span>Thư mời tốt nghiệp</span>
          <b>{card.displayName}</b>
          <i />
          <i />
        </div>
        <div className={s.pocket}>
          <div className={s.stamp} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tem trang trí */}
            <img src={CAMPUS.libraryFront.src} alt="" />
            <span>BK · {d.year}</span>
          </div>
          <div className={s.postmark} aria-hidden="true">
            <b>
              {d.day}.{d.month}
            </b>
            <span>TP.HCM</span>
          </div>
          <div className={s.to}>
            <span>{inviteLead}</span>
            <b>{inviteeName}</b>
          </div>
          <p className={s.from}>
            Người gửi: <b>{card.displayName}</b> · {faculty.shortName}
          </p>
        </div>
        <div className={s.flap} aria-hidden="true" />
        <GateButton className={s.seal} ariaLabel="Mở thư">
          <span className={s.sealHalf} data-half="l" />
          <span className={s.sealHalf} data-half="r" />
          <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} className={s.sealLogo} />
        </GateButton>
      </div>

      <p className={s.hint}>
        <span className={s.hintDot} aria-hidden="true" /> Chạm vào con dấu để mở thư
      </p>
      <div className={s.coverMeta}>
        <b>
          {d.weekdayLong}, {d.day}.{d.month}.{d.year} · {d.clock}
        </b>
        <span>{card.venue}</span>
      </div>
      <GateButton className={s.cta}>Mở thư</GateButton>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={2100} exit="fade" label="Bìa thiệp: phong bì thư mời">
        <div className={s.desk}>
          <article className={s.paper}>
            <header className={s.letterhead}>
              <Image src="/images/site/logo-bk.png" alt="Logo Trường Đại học Bách Khoa" width={200} height={191} className={s.lhLogo} />
              <div>
                <b>Trường Đại học Bách Khoa</b>
                <span>Đại học Quốc gia TP.HCM</span>
              </div>
              <div className={s.lhStamp} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tem trang trí */}
                <img src={CAMPUS.libraryFront.src} alt="" />
              </div>
            </header>

            <h2 className={s.title}>Thư mời</h2>
            <p className={s.subject}>V/v: Dự lễ tốt nghiệp của {card.displayName}</p>

            <figure className={s.clip}>
              <span className={s.paperclip} aria-hidden="true" />
              <Portrait src={coverPhoto} name={card.displayName} className={s.clipPhoto} priority />
              <figcaption>
                {faculty.degreeTitle} · {faculty.shortName}
              </figcaption>
            </figure>

            <p className={s.dear}>
              {inviteLead} <b>{inviteeName}</b>,
            </p>
            <div className={s.body}>
              {paragraphs(message).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <dl className={s.info}>
              <div>
                <dt>Thời gian</dt>
                <dd>
                  {d.clock} · {d.weekdayLong}, {d.day}.{d.month}.{d.year}
                </dd>
              </div>
              <div>
                <dt>Địa điểm</dt>
                <dd>{card.venue} · Cơ sở Lý Thường Kiệt</dd>
              </div>
            </dl>

            <div className={s.signoff}>
              <span>
                TP.HCM, ngày {d.day} tháng {d.monthNum} năm {d.year}
              </span>
              <span className={s.signRole}>Người mời</span>
              <span className={s.signature}>{shortName(card.displayName)}</span>
              <b>{card.displayName}</b>
            </div>
            <span className={s.wax} aria-hidden="true">
              <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} />
            </span>
          </article>

          {blocks.after}

          <figure className={s.band}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh của mẫu */}
            <img src={CAMPUS.libraryGold.src} alt={CAMPUS.libraryGold.alt} loading="lazy" decoding="async" />
            <figcaption>{CAMPUS.libraryGold.place} trước thư viện, mùa tốt nghiệp</figcaption>
          </figure>

          {items.map((it, i) => (
            <section key={it.key} className={s.annex}>
              <header className={s.annexHead}>
                <span>Phụ lục {String(i + 1).padStart(2, '0')}</span>
                <b>{it.kicker}</b>
              </header>
              <div className={s.annexBody}>
                <h3 className={s.annexTitle}>{it.title}</h3>
                {it.body}
              </div>
            </section>
          ))}

          <div className={s.explore}>{blocks.explore}</div>
        </div>
      </Gate>
    </main>
  );
}
