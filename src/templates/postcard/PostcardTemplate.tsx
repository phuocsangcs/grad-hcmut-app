import type { ReactNode } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { PostcardFlip } from './PostcardFlip';
import s from './postcard.module.css';

const TZ = 'Asia/Ho_Chi_Minh';
const fmt = (opt: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, ...opt }).format(d);

/** Bộ bưu thiếp cảnh trường ở cuối thiệp. */
const SET = [CAMPUS.blossom, CAMPUS.yellowPath, CAMPUS.mechanical, CAMPUS.sprinkler, CAMPUS.hall];

/** Khung thư máy bay: viền sọc chéo đỏ xanh. */
function Airmail({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={s.airmail}>
      <div className={s.airmailInner}>
        <h2 className={s.airTitle}>
          <span>Par avion</span>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/**
 * BƯU THIẾP — thiệp là một tấm bưu thiếp gửi từ Bách Khoa.
 * Mặt trước: ảnh của bạn, chữ "Thân gửi từ Bách Khoa" kiểu bưu thiếp du lịch cổ điển.
 * Bấm lật: mặt sau có lời nhắn viết tay, tem hoa kèn, dấu bưu điện mang ngày lễ, ô người nhận.
 * Thông tin lễ nằm trong các phong bì thư máy bay; cuối thiệp là bộ bưu thiếp: ảnh còn lại của bạn + cảnh trường.
 */
export function PostcardTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName, preview }: TemplateProps) {
  const at = new Date(card.ceremonyAt);
  const postmark = fmt({ day: '2-digit', month: '2-digit', year: 'numeric' }, at).replace(/\//g, '.');
  const year = fmt({ year: 'numeric' }, at);
  const firstName = card.displayName.trim().split(/\s+/).pop();
  const front = coverPhoto ?? CAMPUS.b9.src;
  // Ảnh còn lại của người tạo thiệp đứng đầu bộ bưu thiếp, sau đó là cảnh trường.
  const own = (coverPhoto ? card.photos.slice(1) : card.photos).map((src, i) => ({ src, place: `${firstName} #${i + 2}`, alt: `Ảnh ${i + 2} của ${card.displayName}` }));
  const cards = [...own, ...SET];

  const frontFace = (
    <div className={s.front}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh tĩnh */}
      <img className={s.frontPhoto} src={front} alt={coverPhoto ? `Ảnh của ${card.displayName}` : CAMPUS.b9.alt} decoding="async" fetchPriority="high" />
      {/* Nửa phải là cảnh trường để ảnh chân dung dọc ở nửa trái không bị cắt ngang. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh */}
      <img className={s.frontScene} src={CAMPUS.b9.src} alt="" decoding="async" />
      <div className={s.frontShade} aria-hidden="true" />
      <div className={s.greeting}>
        <span className={s.greetSmall}>Thân gửi từ</span>
        <span className={s.greetBig}>Bách Khoa</span>
        <span className={s.greetSub}>
          {faculty.degreeTitle} · {card.displayName}
        </span>
      </div>
    </div>
  );

  const backFace = (
    <div className={s.backInner}>
      <div className={s.note}>
        <p className={s.noteText}>{message}</p>
        <p className={s.noteSign}>Thương, {firstName}</p>
      </div>
      <div className={s.address}>
        <div className={s.stampRow}>
          <span className={s.postmark} aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <defs>
                <path id="pc-ring" d="M50 50m-36 0a36 36 0 1 1 72 0a36 36 0 1 1-72 0" />
              </defs>
              <circle cx="50" cy="50" r="46" />
              <circle cx="50" cy="50" r="27" />
              <text>
                <textPath href="#pc-ring">TP. HỒ CHÍ MINH · BÁCH KHOA ·</textPath>
              </text>
            </svg>
            <b>{postmark}</b>
          </span>
          <span className={s.stamp}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh */}
            <img src={CAMPUS.blossom.src} alt="" />
            <i>{year}</i>
          </span>
        </div>
        <dl className={s.lines}>
          <div>
            <dt>Gửi</dt>
            <dd>
              {inviteLead} {inviteeName}
            </dd>
          </div>
          <div>
            <dt>Hẹn tại</dt>
            <dd>{card.venue}</dd>
          </div>
          <div>
            <dt>Ngày</dt>
            <dd>{fmt({ weekday: 'long', day: 'numeric', month: 'numeric' }, at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <div className={s.sky} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh */}
        <img src={CAMPUS.blossom.src} alt="" />
      </div>

      <div className={s.wrap}>
        <header className={`${s.head} ${preview ? '' : 'rise'}`}>
          <p className={s.kicker}>Bạn có một bưu thiếp mới</p>
          <div className={s.invitee}>{blocks.invitee}</div>
        </header>

        <PostcardFlip front={frontFace} back={backFace} />

        <div className={s.sections}>
          <Airmail title="Lễ tốt nghiệp">
            {blocks.ceremony}
            {blocks.times}
            {blocks.countdown}
          </Airmail>
          {blocks.rsvp || blocks.after ? (
            <Airmail title={blocks.after ? 'Cảm ơn mọi người' : 'Hồi âm'}>
              {blocks.rsvp}
              {blocks.after}
            </Airmail>
          ) : null}
          {blocks.meeting ? <Airmail title="Điểm hẹn sau lễ">{blocks.meeting}</Airmail> : null}
          {blocks.guestbook ? <Airmail title="Thư hồi âm">{blocks.guestbook}</Airmail> : null}
        </div>

        <section className={s.set} aria-label="Bộ bưu thiếp cảnh trường">
          <h2 className={s.setTitle}>Bộ bưu thiếp Bách Khoa</h2>
          <div className={s.setRow}>
            {cards.map((p, i) => (
              <figure key={p.src} className={s.mini} style={{ rotate: `${[-3, 2, -1.5, 3, -2][i % 5]}deg` }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh tĩnh */}
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
                <figcaption>{p.place}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <div className={s.tail}>
          {blocks.actions}
          {blocks.explore}
        </div>
      </div>
    </main>
  );
}
