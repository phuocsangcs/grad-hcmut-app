import type { TemplateProps } from '../types';
import { FacultyMotif } from '../motifs/FacultyMotif';
import { facultyVars } from '../shared/vars';
import { formatTimeVi } from '@/lib/time';
import s from './blueprint.module.css';

/**
 * BẢN VẼ KỸ THUẬT — giấy xanh Bách Khoa có lưới ô, hình vẽ nét trắng,
 * đường kích thước vàng, khung tên bản vẽ ở cuối; mục DUYỆT là chữ ký của khách.
 */
export function BlueprintTemplate({ card, inviteeName, faculty, blocks, message, preview }: TemplateProps) {
  const at = new Date(card.ceremonyAt);
  const dd = card.ceremonyAt.slice(8, 10);
  const mm = card.ceremonyAt.slice(5, 7);
  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <article className={s.sheet}>
        <div className={s.frame} aria-hidden="true" />
        <div className={`${s.title} ${preview ? '' : 'rise'}`}>
          <span className={s.degree}>{faculty.degreeTitle}</span>
          <h1 className={s.name}>{card.displayName}</h1>
          <p className={s.tagline}>{faculty.tagline}</p>
        </div>

        {blocks.invitee}

        <figure className={s.motif}>
          <FacultyMotif motif={faculty.motif} />
          <figcaption>
            <span className={s.dim} />
            <span>
              {formatTimeVi(at)} · {dd}.{mm}.{card.ceremonyAt.slice(0, 4)}
            </span>
          </figcaption>
        </figure>

        <p className={s.message}>{message}</p>

        <dl className={s.titleBlock}>
          <div className={s.tbWide}>
            <dt>Công trình</dt>
            <dd>Lễ tốt nghiệp {card.ceremonyAt.slice(0, 4)}</dd>
          </div>
          <div>
            <dt>Hạng mục</dt>
            <dd>{faculty.shortName}</dd>
          </div>
          <div>
            <dt>Thời điểm</dt>
            <dd className={s.gold}>
              {dd}/{mm} · {formatTimeVi(at)}
            </dd>
          </div>
          <div>
            <dt>Địa điểm</dt>
            <dd>{card.venue}</dd>
          </div>
          <div>
            <dt>Duyệt</dt>
            <dd className={s.sign}>{inviteeName}</dd>
          </div>
        </dl>

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
