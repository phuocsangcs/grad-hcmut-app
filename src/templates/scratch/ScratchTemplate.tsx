import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { dateParts, firstName, paragraphs } from '../shared/date';
import { Gate } from '../shared/Gate';
import { Portrait } from '../shared/Portrait';
import { sectionList } from '../shared/sections';
import { ScratchCard } from './ScratchCard';
import s from './scratch.module.css';

const SPARKS = Array.from({ length: 18 }, (_, i) => ({
  '--a': `${i * 20}deg`,
  '--d': `${(i % 6) * 50}ms`,
  '--c': ['#f4b740', '#e23b3b', '#1488db', '#ffffff'][i % 4],
}));

/**
 * VÉ CÀO MAY MẮN — tấm vé cào "Bách Khoa phát hành".
 * Cào lớp bạc (hoặc bấm Cào giúp tôi) để lộ Giải đặc biệt: một suất dự lễ. Nhận giải → mở thiệp.
 * Bên trong là phiếu lĩnh thưởng với thể lệ vui.
 */
export function ScratchTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const serial = `BK-${d.day}${d.month}-${card.slug.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()}`;
  const items = sectionList(blocks, {
    ceremony: { kicker: 'Thời gian lĩnh giải', title: 'Lễ trao bằng tốt nghiệp' },
    rsvp: { kicker: 'Xác nhận lĩnh giải', title: 'Báo trước để giữ chỗ nha' },
    route: { kicker: 'Nơi lĩnh giải' },
  });

  const cover = (
    <div className={s.coverInner}>
      <div className={s.ticket}>
        <header className={s.tHead}>
          <Image src="/images/site/logo-bk.png" alt="" width={200} height={191} className={s.tLogo} />
          <div>
            <b>Vé cào may mắn</b>
            <span>Bách Khoa phát hành · Kỳ tốt nghiệp {d.year}</span>
          </div>
        </header>
        <div className={s.tMeta}>
          <span>
            Số vé <b>{serial}</b>
          </span>
          <span>
            Dành cho <b>{inviteeName}</b>
          </span>
        </div>

        <ScratchCard claim="Nhận giải · Mở thiệp">
          <div className={s.win}>
            <span className={s.winTag}>Trúng giải đặc biệt</span>
            <b className={s.winPrize}>01 suất dự lễ</b>
            <span className={s.winSub}>xem {card.displayName} nhận bằng</span>
            <div className={s.sparks} aria-hidden="true">
              {SPARKS.map((p, i) => (
                <i key={i} style={p as CSSProperties} />
              ))}
            </div>
          </div>
        </ScratchCard>

        <footer className={s.tFoot}>
          <span>
            Hạn lĩnh giải: <b>{d.clock} · {d.day}.{d.month}.{d.year}</b>
          </span>
          <span>Tại {card.venue} · ĐH Bách Khoa</span>
        </footer>
      </div>
      <p className={s.coverNote}>Vé có giá trị khi người được mời có mặt 😄</p>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={900} exit="zoom" label="Bìa thiệp: vé cào may mắn">
        <header className={s.hero}>
          <p className={s.heroTag}>Phiếu lĩnh thưởng</p>
          <div className={s.heroRow}>
            <Portrait src={coverPhoto} name={card.displayName} className={s.heroPhoto} priority />
            <div>
              <p className={s.heroLabel}>Nhà tài trợ giải thưởng</p>
              <h1 className={s.heroName}>{card.displayName}</h1>
              <p className={s.heroDeg}>
                {faculty.degreeTitle} · {faculty.shortName}
              </p>
            </div>
          </div>
          <div className={s.prizeBar}>
            <span>Người trúng giải</span>
            <b>{inviteeName}</b>
          </div>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.coupon}>
            <p className={s.cKicker}>Lời nhắn của nhà tài trợ</p>
            <p className={s.lead}>{inviteLead} {inviteeName},</p>
            {paragraphs(message).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className={s.sign}>— {name}</p>
          </section>

          <section className={s.coupon}>
            <p className={s.cKicker}>Thể lệ</p>
            <ol className={s.rules}>
              <li>Có mặt trước giờ lễ 15 phút để có chỗ ngồi đẹp.</li>
              <li>Mang theo nụ cười. Hoa và gấu bông: không bắt buộc, nhưng được hoan nghênh.</li>
              <li>Giải thưởng không quy đổi thành tiền mặt, chỉ quy đổi thành cái ôm.</li>
            </ol>
          </section>

          {items.map((it, i) => (
            <section key={it.key} className={s.coupon}>
              <p className={s.cKicker}>
                <span className={s.cNo}>#{String(i + 1).padStart(2, '0')}</span> {it.kicker}
              </p>
              <h2 className={s.cTitle}>{it.title}</h2>
              {it.body}
            </section>
          ))}

          {blocks.explore}
        </div>
      </Gate>
    </main>
  );
}
