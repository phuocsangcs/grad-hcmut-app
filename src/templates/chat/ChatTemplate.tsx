import Image from 'next/image';
import type { ReactNode } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, firstName, paragraphs, shortName } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { Portrait } from '../shared/Portrait';
import { ChatThread, LockClock } from './ChatParts';
import s from './chat.module.css';

function Bubble({ children, tail }: { children: ReactNode; tail?: boolean }) {
  return <p className={s.bubble} data-tail={tail ? '' : undefined}>{children}</p>;
}

function Rich({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className={s.rich}>
      <p className={s.richLabel}>{label}</p>
      {children}
    </section>
  );
}

/**
 * TIN NHẮN — bìa là màn hình khoá điện thoại có thông báo tin nhắn mới.
 * Chạm mở: cuộc trò chuyện hiện từng bong bóng như đang nhắn thật (ảnh, lịch lễ, đếm ngược),
 * xác nhận tham dự nằm trong ô trả lời.
 */
export function ChatTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName, links, preview }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const nick = shortName(card.displayName);

  const items: ReactNode[] = [
    <Bubble key="hi">{inviteeName} ơi 👋</Bubble>,
    ...paragraphs(message).map((p, i) => <Bubble key={`m${i}`}>{p}</Bubble>),
    coverPhoto ? (
      <figure key="photo" className={s.photo}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu */}
        <img src={coverPhoto} alt={`Ảnh của ${card.displayName}`} loading="lazy" decoding="async" />
      </figure>
    ) : null,
    <Bubble key="grad">
      Con tốt nghiệp rồi nè! <b>{faculty.degreeTitle}</b>, {faculty.name} 🎓
    </Bubble>,
    <Rich key="event" label={`📅 Sự kiện · ${d.weekdayLong}, ${d.day}.${d.month}`}>
      <h3 className={s.richTitle}>Lễ trao bằng tốt nghiệp</h3>
      {blocks.ceremony}
      {blocks.times}
      {blocks.countdown}
    </Rich>,
    blocks.gallery ? (
      <Rich key="gallery" label="🖼 Album">
        {blocks.gallery}
      </Rich>
    ) : null,
    blocks.meeting ? (
      <Rich key="meet" label="📍 Vị trí đã chia sẻ">
        {blocks.meeting}
      </Rich>
    ) : null,
    <Bubble key="ask" tail>
      {inviteLead} {inviteeName} đến chung vui với {name} nha 🥰
    </Bubble>,
  ].filter(Boolean);

  const cover = (
    <div className={s.lock}>
      <div className={s.wall} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí */}
        <img src={CAMPUS.blossomA5.src} alt="" fetchPriority="high" />
      </div>
      <div className={s.status} aria-hidden="true">
        <span>BK 5G</span>
        <span className={s.battery}>
          <i />
        </span>
      </div>
      <LockClock />

      <GateButton className={s.notifs} ariaLabel={`Mở tin nhắn của ${card.displayName}`}>
        <span className={s.notif}>
          <span className={s.appIcon}>
            <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} />
          </span>
          <span className={s.notifBody}>
            <span className={s.notifTop}>
              <b>{card.displayName}</b>
              <small>bây giờ</small>
            </span>
            <span>
              {inviteeName} ơi, con tốt nghiệp rồi! Mở tin nhắn nha 🎓
            </span>
          </span>
        </span>
        <span className={s.notif} data-second="">
          <span className={s.appIcon} data-cal="">
            <b>{d.day}</b>
          </span>
          <span className={s.notifBody}>
            <span className={s.notifTop}>
              <b>Lịch · Lễ tốt nghiệp</b>
              <small>
                {d.day}.{d.month}
              </small>
            </span>
            <span>
              {d.clock} · {card.venue} · Trường ĐH Bách Khoa
            </span>
          </span>
        </span>
      </GateButton>

      <GateButton className={s.unlock}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 15l6-6 6 6" />
        </svg>
        Chạm để mở tin nhắn
      </GateButton>
      <span className={s.homeBar} aria-hidden="true" />
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={700} exit="up" label="Bìa thiệp: màn hình khoá có tin nhắn">
        <header className={s.bar}>
          <Portrait src={coverPhoto} name={card.displayName} className={s.avatar} />
          <div className={s.who}>
            <h1>{card.displayName}</h1>
            <span>
              <i /> Đang hoạt động · {faculty.shortName}
            </span>
          </div>
          {links.call ? (
            <a className={s.callBtn} href={links.call} aria-label={`Gọi ${nick}`}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
              </svg>
            </a>
          ) : null}
        </header>

        <div className={s.body}>
          {blocks.after}
          <p className={s.day}>Hôm nay</p>
          <ChatThread items={items} instant={preview} />

          {blocks.rsvp ? (
            <section className={s.reply}>
              <p className={s.replyLabel}>Trả lời {nick}</p>
              {blocks.rsvp}
            </section>
          ) : null}

          {blocks.guestbook ? (
            <section className={s.rich}>
              <p className={s.richLabel}>💬 Lời chúc trong nhóm</p>
              {blocks.guestbook}
            </section>
          ) : null}

          <section className={s.rich}>
            <p className={s.richLabel}>🧭 Đường đến trường</p>
            {blocks.actions}
          </section>

          {blocks.explore}
        </div>
      </Gate>
    </main>
  );
}
