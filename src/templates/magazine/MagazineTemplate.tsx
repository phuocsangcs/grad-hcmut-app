import type { ReactNode } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import s from './magazine.module.css';

const TZ = 'Asia/Ho_Chi_Minh';
const fmt = (opt: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, ...opt }).format(d);

/** Ảnh phóng sự khuôn viên (bố cục: 1 lớn, 2 nhỏ, 1 ngang). */
const ESSAY = [CAMPUS.field, CAMPUS.library, CAMPUS.blossom, CAMPUS.b10];

/** Mã vạch trang trí, sinh từ chuỗi (cùng tên ra cùng mã vạch). */
function Barcode({ seed }: { seed: string }) {
  let h = 2166136261;
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (let i = 0; i < 38; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i % seed.length), 16777619) >>> 0;
    const w = 1 + (h % 3);
    if (i % 2 === 0) bars.push({ x, w });
    x += w + 1;
  }
  return (
    <svg viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b) => (
        <rect key={b.x} x={b.x} width={b.w} height="40" fill="currentColor" />
      ))}
    </svg>
  );
}

function Feature({ id, page, kicker, title, children }: { id: string; page: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={s.feature}>
      <header className={s.featureHead}>
        <span className={s.page}>{page}</span>
        <span className={s.featureKicker}>{kicker}</span>
      </header>
      <h2 className={s.featureTitle}>{title}</h2>
      {children}
    </section>
  );
}

/**
 * TẠP CHÍ — ảnh chân dung của bạn lên bìa một số tạp chí đặc biệt (ý từ các mẫu "người mẫu").
 * Bìa: tên tạp chí lớn, số phát hành theo ngày lễ, các dòng tít, mã vạch.
 * Bên trong: mục lục (bấm để nhảy), thư toà soạn có chữ hoa đầu đoạn, câu trích lớn,
 * phóng sự ảnh khuôn viên, các bài "Lịch lễ", "Hồi âm", "Điểm hẹn".
 * Máy tính: bìa và mục lục đứng cạnh nhau.
 */
export function MagazineTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName, preview }: TemplateProps) {
  const at = new Date(card.ceremonyAt);
  // vi-VN tự chèn chữ "tháng" khi gộp tháng + năm, nên ghép tay: "11/2026".
  const monthYear = `${fmt({ month: '2-digit' }, at)}/${fmt({ year: 'numeric' }, at)}`;
  const dateLong = fmt({ weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' }, at);
  const firstName = card.displayName.trim().split(/\s+/).pop();
  const cover = coverPhoto ?? CAMPUS.b9.src;
  const extra = coverPhoto ? card.photos.slice(1) : card.photos;

  const toc = [
    { id: 'thu', page: '04', label: 'Thư toà soạn', sub: `Lời mời từ ${firstName}` },
    { id: 'phong-su', page: '08', label: 'Phóng sự ảnh', sub: 'Một vòng khuôn viên Bách Khoa' },
    { id: 'lich-le', page: '12', label: 'Lịch lễ', sub: dateLong },
    ...(blocks.rsvp || blocks.after ? [{ id: 'hoi-am', page: '16', label: blocks.after ? 'Lời cảm ơn' : 'Hồi âm', sub: 'Báo giúp mình có đến không nhé' }] : []),
    ...(blocks.meeting ? [{ id: 'diem-hen', page: '20', label: 'Điểm hẹn', sub: 'Chụp hình sau lễ' }] : []),
  ];

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <div className={s.spread}>
        <header className={`${s.cover} ${preview ? '' : 'rise'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh tĩnh */}
          <img className={s.coverImg} src={cover} alt={coverPhoto ? `Ảnh bìa: ${card.displayName}` : CAMPUS.b9.alt} decoding="async" fetchPriority="high" />
          <div className={s.coverShade} aria-hidden="true" />

          <div className={s.issue}>
            <span>Số đặc biệt</span>
            <span>Tháng {monthYear}</span>
            <span>{faculty.code}</span>
          </div>
          <p className={s.masthead} aria-label="Tạp chí Bách Khoa">
            BÁCH KHOA
          </p>

          <ul className={s.coverLines}>
            <li>
              <b>Độc quyền</b>
              Hành trình đến tấm bằng {faculty.shortName}
            </li>
            <li>
              <b>Thư mời</b>
              {inviteLead} {inviteeName}
            </li>
          </ul>

          <div className={s.coverStar}>
            <span className={s.coverDegree}>{faculty.degreeTitle}</span>
            <h1 className={s.coverName}>{card.displayName}</h1>
          </div>

          <div className={s.barcode}>
            <Barcode seed={card.displayName + monthYear} />
            <span>Miễn phí cho người thân</span>
          </div>
        </header>

        <nav className={s.toc} aria-label="Mục lục">
          <p className={s.tocHead}>Trong số này</p>
          <ol>
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`}>
                  <span className={s.tocPage}>{t.page}</span>
                  <span className={s.tocText}>
                    <b>{t.label}</b>
                    <small>{t.sub}</small>
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <div className={s.countdownBox}>
            <p className={s.tocHead}>Phát hành sau</p>
            {blocks.countdown}
          </div>
        </nav>
      </div>

      <div className={s.inside}>
        <Feature id="thu" page="04" kicker="Thư toà soạn" title={`Gửi ${inviteeName}`}>
          <p className={s.letter}>{message}</p>
          <p className={s.byline}>
            — {card.displayName}, {faculty.name}
          </p>
        </Feature>

        <blockquote className={s.quote}>
          <p>“{faculty.tagline}”</p>
        </blockquote>

        <Feature id="phong-su" page="08" kicker="Phóng sự ảnh" title="Một vòng Bách Khoa">
          <div className={s.essay}>
            {ESSAY.map((p) => (
              <figure key={p.src}>
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh */}
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
                <figcaption>{p.place}</figcaption>
              </figure>
            ))}
          </div>
        </Feature>

        <Feature id="lich-le" page="12" kicker="Lịch lễ" title="Hẹn ngày nhận bằng">
          {blocks.ceremony}
          {blocks.times}
        </Feature>

        {blocks.rsvp || blocks.after ? (
          <Feature id="hoi-am" page="16" kicker={blocks.after ? 'Lời cảm ơn' : 'Hồi âm'} title={blocks.after ? 'Cảm ơn đã đến' : 'Bạn sẽ đến chứ?'}>
            {blocks.rsvp}
            {blocks.after}
          </Feature>
        ) : null}

        {blocks.meeting ? (
          <Feature id="diem-hen" page="20" kicker="Điểm hẹn" title="Chụp hình sau lễ">
            {blocks.meeting}
          </Feature>
        ) : null}

        {extra.length > 0 ? (
          <Feature id="hau-truong" page="24" kicker="Hậu trường" title="Ảnh chưa lên bìa">
            <div className={s.backstage}>
              {extra.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu
                <img key={src} src={src} alt={`Ảnh ${i + 2} của ${card.displayName}`} loading="lazy" decoding="async" />
              ))}
            </div>
          </Feature>
        ) : null}

        {blocks.guestbook ? (
          <Feature id="ban-doc" page="28" kicker="Bạn đọc viết" title="Lời chúc">
            {blocks.guestbook}
          </Feature>
        ) : null}

        <div className={s.tail}>
          {blocks.actions}
          {blocks.explore}
        </div>
      </div>
    </main>
  );
}
