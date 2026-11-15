import type { TemplateProps } from '../types';
import { FacultyMotif } from '../motifs/FacultyMotif';
import { facultyVars } from '../shared/vars';
import { splitGreeting } from '../shared/Greeting';
import { Countdown } from '../shared/Countdown';
import s from './glass.module.css';

/**
 * KÍNH — hình vẽ của khoa nằm sau, một tấm kính mờ trượt lên che nửa dưới.
 * Chiều sâu đến từ lớp chồng lớp; bóng hai tầng tông xanh, viền sáng 1px.
 * Tối đa 3 lớp kính trên một màn để không giật trên máy yếu.
 */
export function GlassTemplate({ card, faculty, blocks, message, preview }: TemplateProps) {
  const g = splitGreeting(card.greeting);
  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <div className={s.stage}>
        <div className={s.tint} aria-hidden="true" />
        <div className={s.motif}>
          <FacultyMotif motif={faculty.motif} />
        </div>
        <div className={s.pill}>
          <span className={s.dot} aria-hidden="true" />
          <Countdown ceremonyAt={card.ceremonyAt} initial={card.countdown} variant="inline" />
        </div>

        <section className={`${s.glass} ${preview ? '' : 'rise'}`}>
          <span className={s.faculty}>{faculty.name}</span>
          <div className={s.title}>
            <span className={s.lead}>{g.lead ? `${g.lead} ${g.name},` : g.name}</span>
            <span className={s.degree}>{faculty.degreeTitle}</span>
            <h1 className={s.name}>{card.displayName}</h1>
            <p className={s.tagline}>{faculty.tagline}</p>
          </div>
          <div className={s.wells}>{blocks.ceremony}</div>
          <p className={s.message}>{message}</p>
          {blocks.rsvp}
          {blocks.after}
        </section>
      </div>

      <div className={s.rest}>
        {blocks.meeting}
        {blocks.gallery}
        {blocks.actions}
        {blocks.explore}
      </div>
    </main>
  );
}
