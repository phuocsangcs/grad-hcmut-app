import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { splitGreeting } from '../shared/Greeting';
import { FacultyMotif } from '../motifs/FacultyMotif';
import { formatTimeVi } from '@/lib/time';
import s from './riso.module.css';

/**
 * RISOGRAPH — in hai màu mực xanh + hồng cố ý lệch lớp, chữ danh xưng
 * thật to, hình vẽ của khoa qua lưới chấm, ghi chú viết tay. Trẻ, hợp bạn bè.
 */
export function RisoTemplate({ card, faculty, blocks, message, preview }: TemplateProps) {
  const g = splitGreeting(card.greeting);
  const at = new Date(card.ceremonyAt);
  const words = faculty.degreeTitle.toUpperCase().split(' ');
  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={s.dotsPink} aria-hidden="true" />
          <h1 className={`${s.big} ${preview ? '' : 'rise'}`} aria-label={faculty.degreeTitle}>
            <span className={s.bigPink} aria-hidden="true">
              {words.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </span>
            <span className={s.bigBlue}>
              {words.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </span>
          </h1>
          <span className={s.badge}>
            {card.ceremonyAt.slice(8, 10)}
            <br />
            {card.ceremonyAt.slice(5, 7)}
          </span>
          <div className={s.motif}>
            <FacultyMotif motif={faculty.motif} />
          </div>
          <span className={s.hand}>{g.lead ? `${g.name} ơi!` : 'tới nha!'}</span>
        </div>

        <div className={s.info}>
          <div className={s.nameRow}>
            <span className={s.name}>{card.displayName}</span>
            <span className={s.faculty}>{faculty.shortName.toUpperCase()}</span>
          </div>
          <dl className={s.rule}>
            <div>
              <dt>{new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long' }).format(at).toUpperCase()}</dt>
              <dd>
                {card.ceremonyAt.slice(8, 10)}.{card.ceremonyAt.slice(5, 7)}
              </dd>
            </div>
            <div>
              <dt>LÚC</dt>
              <dd>{formatTimeVi(at)}</dd>
            </div>
            <div>
              <dt>TẠI</dt>
              <dd>{card.venue.replace('Hội trường', 'HT')}</dd>
            </div>
          </dl>
          <p className={s.message}>{message}</p>
          <p className={s.tagline}>{faculty.tagline}</p>
        </div>

        <div className={s.stack}>
          {blocks.rsvp}
          {blocks.after}
          {blocks.countdown}
          {blocks.meeting}
          {blocks.actions}
          {blocks.explore}
        </div>
      </div>
    </main>
  );
}
