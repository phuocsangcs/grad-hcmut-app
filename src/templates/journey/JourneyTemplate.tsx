import Image from 'next/image';
import type { ReactNode } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS, type CampusPhoto } from '../shared/campus';
import s from './journey.module.css';

const TZ = 'Asia/Ho_Chi_Minh';
const fmt = (opt: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, ...opt }).format(d);

/** Bốn chặng đường, mỗi chặng một góc trường. Lời chung, hợp mọi khoa. */
const STOPS: { photo: CampusPhoto; title: string; text: string }[] = [
  { photo: CAMPUS.library, title: 'Bỡ ngỡ', text: 'Ngày đầu đi lạc giữa các dãy nhà, ôm giáo trình chạy qua hành lang thư viện.' },
  { photo: CAMPUS.basketball, title: 'Có bạn', text: 'Những buổi chiều tan học ở lại sân, quen thêm những người bạn đi cùng đến hôm nay.' },
  { photo: CAMPUS.bench, title: 'Chạy deadline', text: 'Ghế đá, hoa vàng và những đêm chạy báo cáo, đồ án, thí nghiệm.' },
  { photo: CAMPUS.b9, title: 'Về đích', text: 'Nắng sớm trên đường đến buổi bảo vệ cuối cùng. Chặng này, mình muốn có mọi người.' },
];

function Stop({ n, photo, title, text, children }: { n: number; photo?: CampusPhoto; title: string; text?: string; children?: ReactNode }) {
  return (
    <li className={s.stop} data-final={children ? '' : undefined}>
      <span className={s.dot} aria-hidden="true">
        {children ? '★' : n}
      </span>
      <div className={s.stopBody}>
        <p className={s.stopKicker}>{children ? 'Đích đến' : `Chặng ${String(n).padStart(2, '0')}`}</p>
        <h2 className={s.stopTitle}>{title}</h2>
        {photo ? (
          <figure className={s.shot}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh đã nén */}
            <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
            <figcaption>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
              </svg>
              {photo.place}
            </figcaption>
          </figure>
        ) : null}
        {text ? <p className={s.stopText}>{text}</p> : null}
        {children}
      </div>
    </li>
  );
}

/**
 * HÀNH TRÌNH — cuộn trang là đi lại bốn năm qua khuôn viên Bách Khoa
 * (ý từ mẫu "Cập Bến" / "Về Đích"): bìa có mã hành trình và trạng thái,
 * đường đi dọc với bốn chặng ảnh khuôn viên, chặng cuối là lễ tốt nghiệp kèm lời mời.
 * Máy tính: các chặng so le hai bên đường đi ở giữa.
 */
export function JourneyTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName, preview }: TemplateProps) {
  const at = new Date(card.ceremonyAt);
  const year = fmt({ year: 'numeric' }, at);
  const dateShort = fmt({ day: '2-digit', month: '2-digit', year: 'numeric' }, at);
  const tracking = `BK-${faculty.code}-${year}`;
  const bg = coverPhoto ?? CAMPUS.mechanical.src;
  const extra = coverPhoto ? card.photos.slice(1) : card.photos;

  return (
    <main className={s.root} data-anim={preview ? undefined : ''} style={facultyVars(faculty)}>
      <header className={s.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh tĩnh */}
        <img className={s.heroImg} src={bg} alt={coverPhoto ? `Ảnh của ${card.displayName}` : ''} decoding="async" fetchPriority="high" />
        <div className={s.heroShade} aria-hidden="true" />
        <div className={s.ticket}>
          <span>Mã hành trình</span>
          <b>{tracking}</b>
        </div>
        <div className={`${s.heroText} ${preview ? '' : 'rise'}`}>
          <span className={s.status}>
            <i aria-hidden="true" /> Sắp cập bến · {dateShort}
          </span>
          <p className={s.heroKicker}>Hành trình {faculty.degreeTitle.toLowerCase()} của</p>
          <h1 className={s.name}>{card.displayName}</h1>
          <p className={s.heroFaculty}>{faculty.name} · Trường Đại học Bách Khoa, ĐHQG-HCM</p>
          <a href="#hanh-trinh" className={s.scroll}>
            Kéo xuống đi cùng mình
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </header>

      <div className={s.intro}>
        <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} className={s.logo} />
        <div>
          <div className={s.invitee}>{blocks.invitee}</div>
          <p className={s.message}>{message}</p>
        </div>
      </div>

      <ol id="hanh-trinh" className={s.route}>
        {STOPS.map((st, i) => (
          <Stop key={st.title} n={i + 1} photo={st.photo} title={st.title} text={st.text} />
        ))}
        <Stop n={5} title="Lễ tốt nghiệp">
          <p className={s.finalInvite}>
            {inviteLead} <strong>{inviteeName}</strong> cùng có mặt ở vạch đích.
          </p>
          <div className={s.final}>
            {blocks.ceremony}
            {blocks.times}
            {blocks.countdown}
            {blocks.rsvp}
            {blocks.after}
          </div>
        </Stop>
      </ol>

      <div className={s.tail}>
        {blocks.meeting}
        {extra.length > 0 ? (
          <section className={s.album} aria-label="Ảnh dọc đường">
            <h2 className={s.albumTitle}>Ảnh dọc đường</h2>
            <div className={s.albumGrid}>
              {extra.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu
                <img key={src} src={src} alt={`Ảnh ${i + 2} của ${card.displayName}`} loading="lazy" decoding="async" />
              ))}
            </div>
          </section>
        ) : null}
        {blocks.guestbook}
        {blocks.actions}
        {blocks.explore}
      </div>
    </main>
  );
}
