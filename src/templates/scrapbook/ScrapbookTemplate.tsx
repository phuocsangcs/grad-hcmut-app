import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { FacultyMotif } from '../motifs/FacultyMotif';
import s from './scrapbook.module.css';

const TZ = 'Asia/Ho_Chi_Minh';
const fmt = (opt: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, ...opt }).format(d);

/** Mảnh băng keo giấy dán góc. */
function Tape({ className, tone = 'blue' }: { className?: string; tone?: 'blue' | 'yellow' | 'pink' }) {
  return <span className={`${s.tape} ${className ?? ''}`} data-tone={tone} aria-hidden="true" />;
}

/** Mũ cử nhân vẽ nét như bút bi. */
function CapDoodle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 16 32 5l28 11-28 11z" />
      <path d="M16 21v11c0 4 7.5 7 16 7s16-3 16-7V21" />
      <path d="M58 17v14" />
      <path d="M58 31c-2 2-2 5 0 7 2-2 2-5 0-7z" />
    </svg>
  );
}

function StarDoodle({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.5l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 16.6l-5.8 3.5 1.6-6.5L2.7 9.2l6.7-.5z" />
    </svg>
  );
}

/** Trang giấy dán băng keo; tiêu đề viết tay. */
function Page({ id, title, tilt = 0, tape = 'blue', children }: { id?: string; title?: string; tilt?: number; tape?: 'blue' | 'yellow' | 'pink'; children: ReactNode }) {
  return (
    <section id={id} className={s.page} style={{ '--tilt': `${tilt}deg` } as CSSProperties}>
      <Tape className={s.pageTape} tone={tape} />
      {title ? <h2 className={s.pageTitle}>{title}</h2> : null}
      {children}
    </section>
  );
}

/**
 * SỔ KỶ NIỆM — thiệp như một trang sổ kỷ yếu dán tay.
 * Giấy kem kẻ chấm, ảnh polaroid nghiêng dán băng keo, giấy nhớ vàng ghi lời mời,
 * tem tròn "Class of …", chữ viết tay và hình vẽ bút bi. Ảnh còn lại thành chồng polaroid.
 * Máy tính: polaroid và tiêu đề đứng cạnh nhau, các trang giấy xếp hai cột.
 */
export function ScrapbookTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName, preview }: TemplateProps) {
  const at = new Date(card.ceremonyAt);
  const year = fmt({ year: 'numeric' }, at);
  const dayMonth = fmt({ day: '2-digit', month: '2-digit' }, at);
  const rest = coverPhoto ? card.photos.slice(1) : card.photos;
  const firstName = card.displayName.trim().split(/\s+/).pop();
  const anim = preview ? '' : s.animate;

  return (
    <main className={`${s.root} ${anim}`} style={facultyVars(faculty)}>
      <div className={s.sheet}>
        <header className={s.hero}>
          <figure className={s.polaroid}>
            <Tape className={s.tapeL} tone="yellow" />
            <Tape className={s.tapeR} tone="pink" />
            <div className={s.photoBox}>
              {coverPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu, đã nén
                <img src={coverPhoto} alt={`Ảnh của ${card.displayName}`} decoding="async" fetchPriority="high" />
              ) : (
                <div className={s.photoEmpty} aria-hidden="true">
                  <FacultyMotif motif={faculty.motif} />
                </div>
              )}
            </div>
            <figcaption className={s.polaroidCaption}>Ngày ra trường · {dayMonth}</figcaption>
          </figure>

          <div className={s.title}>
            <span className={s.stamp} aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <defs>
                  <path id="scrap-ring" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
                </defs>
                <text>
                  <textPath href="#scrap-ring">BÁCH KHOA · ĐHQG-HCM · BÁCH KHOA · ĐHQG-HCM ·</textPath>
                </text>
              </svg>
              <b>
                Class of
                <br />
                {year}
              </b>
            </span>
            <CapDoodle className={s.cap} />
            <p className={s.hello}>Hôm nay mình tốt nghiệp rồi!</p>
            <h1 className={s.name}>{card.displayName}</h1>
            <p className={s.degree}>
              <span className={s.marker}>{faculty.degreeTitle}</span> · {faculty.name}
            </p>
            <div className={s.school}>
              <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} className={s.logo} />
              <span>Trường Đại học Bách Khoa, ĐHQG-HCM</span>
            </div>
          </div>
        </header>

        <div className={s.note}>
          <Tape className={s.noteTape} tone="blue" />
          <p className={s.noteLead}>{inviteLead}</p>
          <p className={s.noteName}>{inviteeName}</p>
          <p className={s.noteText}>đến chung vui ngày {firstName} nhận bằng nha!</p>
          <StarDoodle className={s.noteStar} />
        </div>

        <div className={s.letter}>
          <p>{message}</p>
          <span className={s.sign}>— {firstName}</span>
        </div>

        <div className={s.grid}>
          <Page title="Hẹn gặp ở lễ tốt nghiệp" tilt={-0.8} tape="yellow">
            {blocks.ceremony}
            {blocks.times}
          </Page>
          <Page title="Đếm từng ngày" tilt={0.7} tape="pink">
            {blocks.countdown}
          </Page>
          {blocks.rsvp || blocks.after ? (
            <Page title={blocks.after ? 'Cảm ơn mọi người' : 'Nhớ báo mình nha'} tilt={0.5} tape="blue">
              {blocks.rsvp}
              {blocks.after}
            </Page>
          ) : null}
          {blocks.meeting ? (
            <Page title="Chụp hình sau lễ ở đây" tilt={-0.6} tape="yellow">
              {blocks.meeting}
            </Page>
          ) : null}
          {blocks.guestbook ? (
            <Page title="Lưu bút" tilt={-0.4} tape="pink">
              {blocks.guestbook}
            </Page>
          ) : null}
        </div>

        {rest.length > 0 ? (
          <section className={s.album} aria-label="Album ảnh">
            <h2 className={s.albumTitle}>Vài tấm kỷ niệm</h2>
            <div className={s.albumRow}>
              {rest.map((src, i) => (
                <figure key={src} className={s.mini} style={{ '--tilt': `${i % 2 ? 4 : -3}deg` } as CSSProperties}>
                  <Tape className={s.miniTape} tone={(['blue', 'yellow', 'pink'] as const)[i % 3]} />
                  {/* eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu */}
                  <img src={src} alt={`Ảnh ${i + 2} của ${card.displayName}`} loading="lazy" decoding="async" />
                  <figcaption>#{String(i + 2).padStart(2, '0')}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <div className={s.tail}>
          {blocks.actions}
          {blocks.explore}
        </div>
      </div>
    </main>
  );
}
