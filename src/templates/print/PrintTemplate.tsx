import type { TemplateProps } from '../types';
import { FacultyMotif } from '../motifs/FacultyMotif';
import { facultyVars } from '../shared/vars';
import s from './print.module.css';

/**
 * IN ẤN — giấy sáng, hình vẽ nét theo khoa trên mảng màu nhạt,
 * khối thông tin kẻ vạch kiểu bản vẽ. Không bóng, không gradient.
 */
export function PrintTemplate({ card, faculty, blocks, message, preview }: TemplateProps) {
  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <article className={s.sheet}>
        <header className={s.top}>
          <span className={s.code}>
            {faculty.code} · {card.ceremonyAt.slice(8, 10)}.{card.ceremonyAt.slice(5, 7)}
          </span>
          <span className={s.to}>{card.greeting.replace(/[,!]$/, '').toUpperCase()}</span>
        </header>
        <p className={s.facultyName}>{faculty.name}</p>

        <figure className={s.motif}>
          <FacultyMotif motif={faculty.motif} />
        </figure>

        <div className={`${s.title} ${preview ? '' : 'rise'}`}>
          <span className={s.degree}>{faculty.degreeTitle}</span>
          <h1 className={s.name}>{card.displayName}</h1>
          <p className={s.tagline}>{faculty.tagline}</p>
        </div>

        <div className={preview ? '' : 'rise-2'}>{blocks.ceremony}</div>

        <p className={s.message}>{message}</p>

        <div className={s.stack}>
          {blocks.rsvp}
          {blocks.after}
          {blocks.countdown}
          {blocks.meeting}
          {blocks.actions}
        </div>
      </article>
      <div className={s.explore}>{blocks.explore}</div>
    </main>
  );
}
