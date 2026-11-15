import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { splitGreeting } from '../shared/Greeting';
import { formatTimeVi } from '@/lib/time';
import { Icon } from '@/ui';
import s from './ticket.module.css';

/** Mã vé: dãy lục giác đặc/rỗng sinh từ slug, mỗi thiệp một kiểu. */
function HexCode({ seed }: { seed: string }) {
  const cells = Array.from({ length: 18 }, (_, i) => {
    const c = seed.charCodeAt(i % seed.length) + i * 7;
    return c % 4 === 0 ? 'none' : c % 9 === 0 ? 'var(--sun)' : c % 7 === 0 ? 'var(--rose)' : 'var(--bk-700)';
  });
  return (
    <svg viewBox="0 0 302 20" className={s.hex} aria-hidden="true">
      {cells.map((fill, i) => (
        <path key={i} d={`M${8 + i * 16} 2 L${15 + i * 16} 6 L${15 + i * 16} 14 L${8 + i * 16} 18 L${1 + i * 16} 14 L${1 + i * 16} 6 Z`} fill={fill} stroke={fill === 'none' ? 'var(--bk-700)' : fill} strokeWidth="1.2" />
      ))}
    </svg>
  );
}

/**
 * VÉ MỜI — vé hạng gia đình: cuống xanh đậm, đường xé răng cưa, mã vé tổ ong,
 * dấu mộc hồng "ĐÃ MỜI". Phẳng, góc vuông, chữ mono cho phần số liệu.
 */
export function TicketTemplate({ card, faculty, blocks, message, preview }: TemplateProps) {
  const g = splitGreeting(card.greeting);
  const at = new Date(card.ceremonyAt);
  const dd = card.ceremonyAt.slice(8, 10);
  const mm = card.ceremonyAt.slice(5, 7);
  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <div className={s.wrap}>
        <header className={s.meta}>
          <span>NGÀY RA TRƯỜNG</span>
          <span>Nº {card.slug.toUpperCase().replace(/-/g, '').slice(0, 8)} · {card.ceremonyAt.slice(0, 4)}</span>
        </header>

        <article className={`${s.ticket} ${preview ? '' : 'rise'}`}>
          <div className={s.stub}>
            <span className={s.class}>VÉ MỜI · HẠNG GIA ĐÌNH</span>
            <span className={s.degree}>{faculty.degreeTitle}</span>
            <h1 className={s.name}>{card.displayName.toUpperCase()}</h1>
            <span className={s.faculty}>{faculty.name}</span>
            <span className={s.stamp} aria-hidden="true">
              ĐÃ
              <br />
              MỜI
              <br />
              {dd}·{mm}
            </span>
          </div>

          <div className={s.body}>
            <dl className={s.facts}>
              <div>
                <dt>Ngày</dt>
                <dd>
                  {dd}.{mm}
                </dd>
              </div>
              <div>
                <dt>Giờ</dt>
                <dd>{formatTimeVi(at)}</dd>
              </div>
              <div>
                <dt>Cổng</dt>
                <dd>{card.venue.replace('Hội trường ', '')}</dd>
              </div>
            </dl>
            {card.meeting ? (
              <p className={s.meet}>
                <Icon name="pin" size={16} /> Điểm hẹn sau lễ: {card.meeting.poi.name}
                {card.meeting.time ? ` · ${card.meeting.time}` : ''}
              </p>
            ) : null}
          </div>

          <div className={s.tear} aria-hidden="true">
            <span />
            <span />
          </div>

          <div className={s.foot}>
            <div className={s.guest}>
              <span>
                <small>Khách mời</small>
                <b>{g.name}</b>
              </span>
              <span className={s.right}>
                <small>Châm ngôn</small>
                <b>{faculty.tagline}</b>
              </span>
            </div>
            <HexCode seed={card.slug} />
            <span className={s.code}>
              BK·{card.ceremonyAt.slice(0, 4)}·{faculty.code}·{card.slug.toUpperCase().replace(/-/g, '')}
            </span>
            <p className={s.message}>{message}</p>
          </div>
        </article>

        <div className={s.stack}>
          {blocks.rsvp}
          {blocks.guestbook}
          {blocks.after}
          {blocks.countdown}
          {blocks.times}
          {blocks.meeting}
          {blocks.gallery}
          {blocks.actions}
          {blocks.explore}
        </div>
      </div>
    </main>
  );
}
