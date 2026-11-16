import Image from 'next/image';
import type { TemplateProps } from '../types';
import { poisFile } from '@/modules/content';
import { Icon } from '@/ui';
import s from './royal.module.css';

const part = (opt: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', ...opt }).format(d);

/** Dải hoa văn nhỏ ngăn các phần (vẽ bằng SVG, màu vàng). */
function Ornament() {
  return (
    <div className={s.ornament} aria-hidden="true">
      <span />
      <svg viewBox="0 0 60 14" width="60" height="14">
        <path d="M2 7h14M44 7h14" stroke="currentColor" strokeWidth="1" />
        <path d="M30 1l4 6-4 6-4-6z" fill="currentColor" />
        <path d="M18 7c3-4 6-4 8 0M42 7c-3-4-6-4-8 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span />
    </div>
  );
}

/**
 * TRANG TRỌNG — thư mời nền lụa kem, khung viền vàng, dải ruy băng xanh đậm ghi tên khoa,
 * huy hiệu Trường ở giữa. Bố cục theo thư mời tốt nghiệp truyền thống:
 * Thư mời → tên → lời mời (Thương mời: …) → ngày (Tháng | ngày | Năm) → giờ → địa điểm → liên hệ.
 */
export function RoyalTemplate({ card, faculty, blocks, message, preview }: TemplateProps) {
  const at = new Date(card.ceremonyAt);
  const day = part({ day: 'numeric' }, at);
  const month = part({ month: 'numeric' }, at);
  const year = part({ year: 'numeric' }, at);
  const clock = part({ hour: '2-digit', minute: '2-digit', hour12: false }, at);
  const times = [card.beforeTime && `${card.beforeTime} (Trước lễ)`, card.afterTime && `${card.afterTime} (Sau lễ)`].filter(Boolean) as string[];

  return (
    <main className={s.root}>
      <article className={s.sheet}>
        <div className={s.frame} aria-hidden="true" />
        <div className={s.ribbon} aria-hidden="true">
          <span>{faculty.shortName}</span>
        </div>

        <header className={s.school}>
          <span className={s.seal}>
            <Image src="/images/site/logo-bk.png" alt="Logo Trường Đại học Bách Khoa" width={200} height={191} priority />
          </span>
          <p className={s.schoolName}>
            Trường Đại học Bách Khoa
            <br />
            ĐHQG-HCM
          </p>
        </header>
        <Ornament />

        <div className={`${s.heading} ${preview ? '' : 'rise'}`}>
          <h1 className={s.invite}>Thư mời</h1>
          <p className={s.event}>Tham dự lễ tốt nghiệp</p>
          <p className={s.of}>của</p>
          <p className={s.name}>{card.displayName}</p>
          <p className={s.degree}>
            {faculty.degreeTitle} · {faculty.name}
          </p>
        </div>

        <div className={s.invitee}>{blocks.invitee}</div>
        <p className={s.message}>{message}</p>

        <div className={s.date} aria-label="Ngày lễ">
          <span>Tháng {month}</span>
          <b>{day}</b>
          <span>Năm {year}</span>
        </div>

        <p className={s.clock}>
          <Icon name="clock" size={22} />
          <span>{clock} · Lễ chính thức</span>
        </p>
        {times.length > 0 ? <p className={s.times}>{times.join('   |   ')}</p> : null}
        <Ornament />

        <dl className={s.where}>
          <div>
            <span className={s.pin} aria-hidden="true">
              <Icon name="pin" size={20} />
            </span>
            <dt>Địa điểm:</dt>
            <dd>
              {card.venue}, {poisFile.campus.name}
              <br />
              <small>({poisFile.campus.address})</small>
            </dd>
          </div>
          {card.phone ? (
            <div>
              <span className={s.pin} aria-hidden="true">
                <Icon name="phone" size={20} />
              </span>
              <dt>Liên hệ:</dt>
              <dd>
                {card.phone} ({card.displayName})
              </dd>
            </div>
          ) : null}
        </dl>
      </article>

      <div className={s.stack}>
        {blocks.rsvp}
        {blocks.guestbook}
        {blocks.after}
        {blocks.countdown}
        {blocks.meeting}
        {blocks.gallery}
        {blocks.actions}
        {blocks.explore}
      </div>
    </main>
  );
}
