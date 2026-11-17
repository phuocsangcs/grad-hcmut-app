import type { TemplateProps } from '../types';
import { FacultyMotif } from '../motifs/FacultyMotif';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import s from './print.module.css';

/**
 * IN ẤN — giấy sáng, hình vẽ nét theo khoa trên mảng màu nhạt,
 * khối thông tin kẻ vạch kiểu bản vẽ, ảnh khuôn viên chú thích kiểu sách. Không bóng, không gradient.
 */
export function PrintTemplate({ card, faculty, blocks, message, preview }: TemplateProps) {
  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <article className={s.sheet}>
        <p className={s.facultyName}>{faculty.name}</p>

        <figure className={s.motif}>
          <FacultyMotif motif={faculty.motif} />
        </figure>

        <div className={`${s.title} ${preview ? '' : 'rise'}`}>
          <span className={s.degree}>{faculty.degreeTitle}</span>
          <h1 className={s.name}>{card.displayName}</h1>
          <p className={s.tagline}>{faculty.tagline}</p>
        </div>

        {blocks.invitee}

        <div className={preview ? '' : 'rise-2'}>{blocks.ceremony}</div>

        <figure className={s.photo}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh của mẫu */}
          <img src={CAMPUS.yellowPath.src} alt={CAMPUS.yellowPath.alt} loading="lazy" decoding="async" />
          <figcaption>
            <b>Hình 1</b> — {CAMPUS.yellowPath.place}, Trường Đại học Bách Khoa
          </figcaption>
        </figure>

        <p className={s.message}>{message}</p>

        <div className={s.stack}>
          {blocks.rsvp}
          {blocks.guestbook}
          {blocks.after}
          {blocks.countdown}
          {blocks.times}
          {blocks.meeting}
          {blocks.gallery}
          {blocks.actions}
        </div>
      </article>
      <div className={s.explore}>{blocks.explore}</div>
    </main>
  );
}
