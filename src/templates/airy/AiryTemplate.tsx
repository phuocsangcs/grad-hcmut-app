import type { TemplateProps } from '../types';
import { FacultyMotif } from '../motifs/FacultyMotif';
import { facultyVars } from '../shared/vars';
import { splitGreeting } from '../shared/Greeting';
import { Chip } from '@/ui';
import { formatTimeVi } from '@/lib/time';
import s from './airy.module.css';

/**
 * BAY BỔNG — mảng màu cắt giấy, hình vẽ của khoa nghiêng và trôi nhẹ,
 * chữ "Tân Cử nhân" thật lớn tách hai dòng lệch nhau. Phẳng, nhiều khoảng thở.
 */
export function AiryTemplate({ card, faculty, blocks, message, preview }: TemplateProps) {
  const g = splitGreeting(card.greeting);
  const [t1, ...rest] = faculty.degreeTitle.split(' ');
  const at = new Date(card.ceremonyAt);
  const day = `${card.ceremonyAt.slice(8, 10)}.${card.ceremonyAt.slice(5, 7)}`;
  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <div className={s.canvas}>
        <svg className={s.blobs} viewBox="0 0 390 560" aria-hidden="true" preserveAspectRatio="xMidYMin slice">
          <path d="M232 -36 C350 -46 440 50 426 170 C414 290 330 352 226 326 C128 302 70 230 88 136 C102 54 150 -30 232 -36 Z" fill="var(--t-soft)" />
          <circle cx="214" cy="200" r="168" fill="none" stroke="var(--t-accent)" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="350" cy="372" r="10" fill="var(--t-accent)" />
          <circle cx="40" cy="96" r="4" fill="var(--sun)" />
          <path d="M40 546 C110 528 190 560 262 540 S340 528 360 534" fill="none" stroke="var(--t-accent)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>

        <header className={s.head}>
          <span className={s.lead}>{g.lead ? `${g.lead} ${g.name},` : g.name}</span>
          <span className={s.faculty}>{faculty.name}</span>
        </header>

        <div className={`${s.motif} ${preview ? '' : s.drift}`}>
          <FacultyMotif motif={faculty.motif} />
        </div>

        <h1 className={`${s.degree} ${preview ? '' : 'rise'}`}>
          <span>{t1}</span>
          <span className={s.degree2}>{rest.join(' ')}</span>
        </h1>

        <div className={`${s.who} ${preview ? '' : 'rise-2'}`}>
          <span className={s.name}>{card.displayName}</span>
          <span className={s.tagline}>{faculty.tagline}</span>
        </div>

        <div className={s.chips}>
          <Chip tone="outline">{day}</Chip>
          <Chip tone="outline">{formatTimeVi(at)}</Chip>
          <Chip tone="outline">{card.venue}</Chip>
        </div>

        <p className={s.message}>{message}</p>
        <div className={s.stack}>
          {blocks.rsvp}
          {blocks.after}
          {blocks.countdown}
          {blocks.meeting}
          {blocks.gallery}
          {blocks.actions}
          {blocks.explore}
        </div>
      </div>
    </main>
  );
}
