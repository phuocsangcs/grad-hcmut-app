import Image from 'next/image';
import type { ReactNode } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { poisFile } from '@/modules/content';
import { DossierGate } from './DossierGate';
import s from './dossier.module.css';

const TZ = 'Asia/Ho_Chi_Minh';
const part = (opt: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: TZ, ...opt }).format(d);
const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const BG = '/images/site/campus-hoa-ken.jpg';

/** Lưới tổ ong (lục giác đỉnh nhọn, như khối lập phương trong logo Bách Khoa). */
function Honeycomb({ id }: { id: string }) {
  const r = 16;
  const w = Math.sqrt(3) * r;
  const hex = (cx: number, cy: number) =>
    `M${cx} ${cy - r}L${cx + w / 2} ${cy - r / 2}L${cx + w / 2} ${cy + r / 2}L${cx} ${cy + r}L${cx - w / 2} ${cy + r / 2}L${cx - w / 2} ${cy - r / 2}Z`;
  return (
    <svg className={s.honeycomb} aria-hidden="true">
      <defs>
        <pattern id={id} width={w} height={3 * r} patternUnits="userSpaceOnUse">
          <path d={`${hex(w / 2, r)}${hex(0, 2.5 * r)}${hex(w, 2.5 * r)}`} fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Ảnh chân dung cắt lục giác; chưa có ảnh thì hiện chữ cái đầu. */
function HexPhoto({ src, name, size = 'lg' }: { src: string | null; name: string; size?: 'lg' | 'sm' }) {
  const initials = name
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className={s.hexWrap} data-size={size}>
      <div className={s.hexRing} aria-hidden="true" />
      <div className={s.hex}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu, đã nén
          <img src={src} alt={`Ảnh của ${name}`} decoding="async" />
        ) : (
          <span className={s.initials}>{initials}</span>
        )}
      </div>
    </div>
  );
}

function Section({ n, label, title, children }: { n: number; label: string; title?: string; children: ReactNode }) {
  return (
    <section className={s.section}>
      <header className={s.sectionHead}>
        <span className={s.num}>{String(n).padStart(2, '0')}</span>
        <span className={s.label}>{label}</span>
      </header>
      {title ? <h2 className={s.sectionTitle}>{title}</h2> : null}
      {children}
    </section>
  );
}

/**
 * HỒ SƠ TỐT NGHIỆP — thiệp hai lớp kiểu "mở thiệp":
 * bìa một màn hình (ảnh khuôn viên mờ, tổ ong BK, ảnh lục giác, nút Mở hồ sơ),
 * bấm mở thì đóng mộc ĐÃ TỐT NGHIỆP rồi lộ nội dung đánh số 01, 02…
 */
export function DossierTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName }: TemplateProps) {
  const at = new Date(card.ceremonyAt);
  const day = part({ day: '2-digit' }, at);
  const month = part({ month: '2-digit' }, at);
  const monthNum = part({ month: 'numeric' }, at);
  const year = part({ year: 'numeric' }, at);
  const clock = part({ hour: '2-digit', minute: '2-digit', hour12: false }, at);
  const weekdayLong = part({ weekday: 'long' }, at);
  const weekdayShort = WEEKDAY_SHORT[new Date(at.toLocaleString('en-US', { timeZone: TZ })).getDay()];
  const shortName = card.displayName.trim().split(/\s+/).slice(-2).join(' ');
  const paragraphs = message.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  const cover = (
    <>
      <div className={s.backdrop} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí */}
        <img src={BG} alt="" />
      </div>
      <Honeycomb id="dossier-cover-hc" />

      <p className={s.topline}>
        Thiệp mời tốt nghiệp <i className={s.dot} /> {year}
      </p>

      <div className={s.coverHead}>
        <span className={s.chip}>{faculty.degreeTitle}</span>
        <h1 className={s.coverName}>{card.displayName}</h1>
        <p className={s.coverSub}>
          {faculty.name}
          <br />
          Trường Đại học Bách Khoa · ĐHQG-HCM
        </p>
      </div>

      <HexPhoto src={coverPhoto} name={card.displayName} />

      <div className={s.slip}>
        <span className={s.slipLabel}>Lịch lễ</span>
        <b className={s.slipDate}>
          {weekdayShort} · {day}.{month}.{year} · {clock}
        </b>
        <span className={s.slipVenue}>{card.venue}</span>
      </div>

      <div className={s.coverInvitee}>
        <span>{inviteLead}</span>
        <b>{inviteeName}</b>
      </div>
    </>
  );

  let n = 0;
  const next = () => ++n;

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <DossierGate cover={cover}>
        <header className={s.hero}>
          <div className={s.heroBg} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh nền trang trí */}
            <img src={BG} alt="" />
          </div>
          <div className={s.school}>
            <Image src="/images/site/logo-bk.png" alt="Logo Trường Đại học Bách Khoa" width={200} height={191} />
            <span>
              Trường Đại học Bách Khoa
              <br />
              ĐHQG-HCM
            </span>
          </div>
          <h2 className={s.heroTitle}>Lễ tốt nghiệp</h2>

          <div className={s.frame}>
            <HexPhoto src={coverPhoto} name={card.displayName} />
            <span className={s.frameChip}>{faculty.degreeTitle}</span>
          </div>

          <h1 className={s.heroName}>{card.displayName}</h1>
          <p className={s.tagline}>{faculty.tagline}</p>

          <dl className={s.facts}>
            <div>
              <dt>Trường</dt>
              <dd>Đại học Bách Khoa, ĐHQG-HCM</dd>
            </div>
            <div>
              <dt>{faculty.kind === 'faculty' ? 'Khoa' : 'Chương trình'}</dt>
              <dd>
                {faculty.kind === 'faculty' ? faculty.name.replace(/^Khoa\s+/i, '') : faculty.name}
                {card.oisp ? ' · OISP' : ''}
              </dd>
            </div>
            <div>
              <dt>Năm</dt>
              <dd>{year}</dd>
            </div>
          </dl>
          <p className={s.heroDate}>
            {weekdayLong}, {day}.{month}.{year} · {clock}
          </p>
          <div className={s.heroInvitee}>
            <span>{inviteLead}</span>
            <b>{inviteeName}</b>
          </div>
        </header>

        <div className={s.sections}>
          {blocks.after}

          <Section n={next()} label="Thư mời">
            <p className={s.from}>
              <span>Người mời</span>
              <b>{card.displayName}</b>
            </p>
            <div className={s.letter}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Section>

          {blocks.gallery ? (
            <Section n={next()} label="Kỷ niệm">
              {blocks.gallery}
            </Section>
          ) : null}

          <Section n={next()} label="Buổi lễ" title="Lễ trao bằng tốt nghiệp">
            <div className={s.when}>
              <div className={s.bigDay}>
                <b>{day}</b>
                <span>
                  Tháng {monthNum} · {year}
                </span>
                <small>{weekdayLong}</small>
              </div>
              <dl className={s.whenList}>
                <div>
                  <dt>Giờ</dt>
                  <dd>{clock}</dd>
                </div>
                <div>
                  <dt>Địa điểm</dt>
                  <dd>
                    {card.venue}
                    <small>{poisFile.campus.name}</small>
                  </dd>
                </div>
              </dl>
            </div>
            {blocks.times}
            <p className={s.mini}>Đếm ngược tới giờ lễ</p>
            {blocks.countdown}
          </Section>

          {blocks.rsvp ? (
            <Section n={next()} label="Xác nhận" title="Bạn có mặt chứ?">
              {blocks.rsvp}
            </Section>
          ) : null}

          {blocks.guestbook ? (
            <Section n={next()} label="Lời chúc" title="Sổ lưu bút">
              {blocks.guestbook}
            </Section>
          ) : null}

          {blocks.meeting ? (
            <Section n={next()} label="Điểm hẹn" title="Gặp nhau sau lễ">
              {blocks.meeting}
            </Section>
          ) : null}

          <Section n={next()} label="Đường đến" title={poisFile.campus.name}>
            <p className={s.address}>{poisFile.campus.address}</p>
            {blocks.actions}
          </Section>

          <p className={s.sign}>
            <i className={s.dot} /> {shortName} · {year} <i className={s.dot} />
          </p>
          {blocks.explore}
        </div>
      </DossierGate>
    </main>
  );
}
