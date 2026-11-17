import Image from 'next/image';
import type { ReactNode } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { FacultyMotif } from '../motifs/FacultyMotif';
import { Icon, type IconName } from '@/ui';
import { FeedCarousel, FeedLike } from './FeedClient';
import s from './feed.module.css';

const TZ = 'Asia/Ho_Chi_Minh';
const fmt = (opt: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, ...opt }).format(d);

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** "Tân Cử nhân" → "#TânCửNhân" */
function tag(text: string) {
  return '#' + text.replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('');
}

function Avatar({ src, name, ring }: { src: string | null; name: string; ring?: boolean }) {
  return (
    <span className={s.avatar} data-ring={ring ? '' : undefined}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu
        <img src={src} alt="" decoding="async" />
      ) : (
        <span>{initialsOf(name)}</span>
      )}
    </span>
  );
}

function Verified() {
  return (
    <svg className={s.verified} viewBox="0 0 24 24" aria-label="Đã tốt nghiệp" role="img">
      <path d="M12 1.5l2.6 2 3.2-.3 1 3.1 2.8 1.6-.9 3.1.9 3.1-2.8 1.6-1 3.1-3.2-.3-2.6 2-2.6-2-3.2.3-1-3.1-2.8-1.6.9-3.1-.9-3.1 2.8-1.6 1-3.1 3.2.3z" fill="currentColor" />
      <path d="M7.5 12.2l3 3 6-6.4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Một "tin nổi bật" tròn: bấm để nhảy tới mục tương ứng. */
function Story({ href, icon, label }: { href: string; icon: IconName; label: string }) {
  return (
    <a href={href} className={s.story}>
      <span className={s.storyRing}>
        <span className={s.storyIcon}>
          <Icon name={icon} size={22} />
        </span>
      </span>
      <span className={s.storyLabel}>{label}</span>
    </a>
  );
}

function Panel({ id, icon, title, children }: { id?: string; icon: IconName; title: string; children: ReactNode }) {
  return (
    <section id={id} className={s.panel}>
      <h2 className={s.panelTitle}>
        <Icon name={icon} size={18} />
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * BÀI ĐĂNG — thiệp dựng như một bài đăng mạng xã hội (ý từ mẫu "Xin Vía Xịn").
 * Đầu trang là hàng "tin nổi bật" để nhảy nhanh tới từng mục; giữa là bài đăng:
 * ảnh vuốt ngang, thả tim, chú thích kèm hashtag; lời chúc của khách thành bình luận,
 * ô xác nhận tham dự nằm ngay dưới như ô viết bình luận.
 * Máy tính: bài đăng bên trái, cột thông tin lễ bên phải.
 */
export function FeedTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName, preview }: TemplateProps) {
  const at = new Date(card.ceremonyAt);
  const dateLine = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, at);
  const year = fmt({ year: 'numeric' }, at);
  const handle = card.slug;
  const photos = coverPhoto ? card.photos : [];
  const tags = [tag(faculty.degreeTitle), '#BáchKhoa', `#${faculty.code}`, `#ClassOf${year}`, '#NgàyRaTrường'];
  const wishes = card.wishes;

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <div className={s.shell}>
        <nav className={s.stories} aria-label="Mục trong thiệp">
          <a href="#post" className={s.story}>
            <Avatar src={coverPhoto} name={card.displayName} ring />
            <span className={s.storyLabel}>Bài đăng</span>
          </a>
          <Story href="#le" icon="calendar" label="Lễ" />
          {blocks.rsvp ? <Story href="#binh-luan" icon="check" label="Xác nhận" /> : null}
          {blocks.meeting ? <Story href="#hen" icon="pin" label="Điểm hẹn" /> : null}
          <Story href="#dem-nguoc" icon="clock" label="Đếm ngược" />
          <Story href="#kham-pha" icon="map" label="Khám phá" />
        </nav>

        <div className={s.columns}>
          <article id="post" className={`${s.post} ${preview ? '' : 'rise'}`}>
            <header className={s.postHead}>
              <Avatar src={coverPhoto} name={card.displayName} />
              <div className={s.who}>
                <span className={s.whoName}>
                  {card.displayName}
                  <Verified />
                </span>
                <span className={s.whoSub}>Trường Đại học Bách Khoa · {faculty.shortName}</span>
              </div>
              <Icon name="more" size={20} className={s.more} />
            </header>

            <FeedCarousel photos={photos} name={card.displayName}>
              <div className={s.placeholder} aria-hidden="true">
                <div className={s.placeholderMotif}>
                  <FacultyMotif motif={faculty.motif} />
                </div>
                <span className={s.placeholderText}>{faculty.degreeTitle}</span>
              </div>
            </FeedCarousel>

            <div className={s.actions}>
              <FeedLike name={card.displayName} />
              <a href="#binh-luan" className={s.iconBtn} aria-label="Tới phần bình luận">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20l1.2-4.2A8.5 8.5 0 1 1 20.5 11.5z" />
                </svg>
              </a>
              <a href="#kham-pha" className={s.iconBtn} aria-label="Chia sẻ thiệp">
                <Icon name="share" size={24} />
              </a>
              <span className={s.grad} aria-hidden="true">
                <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} />
              </span>
            </div>

            <div className={s.caption}>
              <p>
                <b>{handle}</b> {message}
              </p>
              <p className={s.tags}>{tags.join(' ')}</p>
              <p className={s.when}>{dateLine}</p>
            </div>

            <section id="binh-luan" className={s.comments} aria-label="Bình luận">
              <div className={s.comment} data-pinned="">
                <Avatar src={coverPhoto} name={card.displayName} />
                <div className={s.commentBody}>
                  <p>
                    <b>{handle}</b>
                    <span className={s.pin}>Đã ghim</span>
                  </p>
                  <p className={s.inviteLine}>
                    {inviteLead} <strong>{inviteeName}</strong> đến chung vui ngày {card.displayName.split(/\s+/).pop()} nhận bằng nhé!
                  </p>
                </div>
              </div>

              {wishes.length > 0 ? (
                <>
                  <p className={s.commentCount}>{wishes.length} lời chúc</p>
                  <ul className={s.commentList}>
                    {wishes.map((w) => (
                      <li key={w.id} className={s.comment}>
                        <Avatar src={null} name={w.name} />
                        <div className={s.commentBody}>
                          <p>
                            <b>{w.name}</b> {w.wish}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {blocks.rsvp ? <div className={s.reply}>{blocks.rsvp}</div> : null}
              {blocks.after ? <div className={s.reply}>{blocks.after}</div> : null}
            </section>
          </article>

          <aside className={s.side}>
            <Panel id="le" icon="calendar" title="Lễ tốt nghiệp">
              {blocks.ceremony}
              {blocks.times}
            </Panel>
            <Panel id="dem-nguoc" icon="clock" title="Còn bao lâu nữa">
              {blocks.countdown}
            </Panel>
            {blocks.meeting ? (
              <Panel id="hen" icon="pin" title="Gặp nhau sau lễ">
                {blocks.meeting}
              </Panel>
            ) : null}
            <div className={s.panelPlain}>{blocks.actions}</div>
            <div id="kham-pha" className={s.panelPlain}>
              {blocks.explore}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
