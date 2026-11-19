import type { ReactNode } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { dateParts, daysUntil, firstName, paragraphs } from '../shared/date';
import { Gate, GateButton, GateSkip } from '../shared/Gate';
import { sectionList } from '../shared/sections';
import { TearPad } from './TearPad';
import s from './calendar.module.css';

const MONTHS = ['', 'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp'];

function Sheet({ top, big, red, foot, children }: { top: string; big: string; red?: boolean; foot?: string; children?: ReactNode }) {
  return (
    <div className={s.page} data-red={red ? '' : undefined}>
      <span className={s.holes} aria-hidden="true" />
      <p className={s.pTop}>{top}</p>
      <b className={s.pBig}>{big}</b>
      {foot ? <p className={s.pFoot}>{foot}</p> : null}
      {children}
    </div>
  );
}

/**
 * LỊCH BLOC — tập lịch treo tường kiểu Việt Nam.
 * Xé tờ hôm nay → tờ "còn N ngày" → tờ ngày lễ in đỏ: Nên đi dự lễ, Kỵ vắng mặt. Bấm Mở thiệp.
 * Bên trong mỗi mục là một tờ lịch có lỗ bấm; lời mời in như mặt sau tờ lịch.
 */
export function CalendarTemplate({ card, faculty, blocks, message, inviteLead, inviteeName }: TemplateProps) {
  const now = new Date();
  const today = dateParts(now);
  const d = dateParts(card.ceremonyAt);
  const left = daysUntil(card.ceremonyAt, now);
  const name = firstName(card.displayName);
  const items = sectionList(blocks);
  const sameDay = today.day === d.day && today.month === d.month && today.year === d.year;

  const pages: ReactNode[] = [];
  if (!sameDay) {
    pages.push(
      <Sheet key="today" top={`${MONTHS[+today.monthNum]} · ${today.year}`} big={today.day} foot={today.weekdayLong}>
        <p className={s.pNote}>Hôm nay · chạm để xé tờ lịch</p>
      </Sheet>,
    );
    if (left > 1) {
      pages.push(
        <Sheet key="left" top="Còn" big={String(left)} foot="ngày nữa">
          <p className={s.pNote}>
            là tới ngày {name} tốt nghiệp. Xé tiếp nào!
          </p>
        </Sheet>,
      );
    }
  }

  const last = (
    <Sheet top={`${MONTHS[+d.monthNum]} · ${d.year}`} big={d.day} red foot={d.weekdayLong}>
      <p className={s.pEvent}>Lễ tốt nghiệp của {card.displayName}</p>
      <dl className={s.goodBad}>
        <div>
          <dt>Nên</dt>
          <dd>Dự lễ · Chụp ảnh · Ôm nhau</dd>
        </div>
        <div>
          <dt>Kỵ</dt>
          <dd>Vắng mặt · Đến trễ</dd>
        </div>
        <div>
          <dt>Giờ tốt</dt>
          <dd>
            {d.clock} · {card.venue}
          </dd>
        </div>
      </dl>
      <GateButton className={s.openBtn}>Mở thiệp mời</GateButton>
    </Sheet>
  );

  const cover = (
    <div className={s.wall}>
      <p className={s.kicker}>
        <b>{inviteeName}</b> ơi, xé lịch cùng {name} nhé
      </p>
      <div className={s.hang} aria-hidden="true">
        <span className={s.nail} />
        <span className={s.string} />
      </div>
      <div className={s.calendar}>
        <header className={s.board}>
          <span>Lịch Bách Khoa</span>
          <b>{d.year}</b>
        </header>
        <TearPad pages={pages} last={last} />
      </div>
      <GateSkip className={s.skip} />
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={900} exit="up" label="Bìa thiệp: lịch bloc">
        <header className={s.hero}>
          <div className={s.heroSheet}>
            <span className={s.holes} aria-hidden="true" />
            <p className={s.pTop}>
              {MONTHS[+d.monthNum]} · {d.year}
            </p>
            <b className={s.heroDay}>{d.day}</b>
            <p className={s.pFoot}>{d.weekdayLong}</p>
            <h1 className={s.heroName}>{card.displayName}</h1>
            <p className={s.heroDeg}>
              {faculty.degreeTitle} · {faculty.name}
            </p>
            <p className={s.heroTime}>
              {d.clock} · {card.venue} · Trường ĐH Bách Khoa
            </p>
          </div>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.back}>
            <p className={s.backKicker}>Mặt sau tờ lịch · Lời hay ý đẹp</p>
            <blockquote className={s.quote}>“{faculty.tagline}”</blockquote>
            <p className={s.to}>
              {inviteLead} <b>{inviteeName}</b>,
            </p>
            {paragraphs(message).map((p, i) => (
              <p key={i} className={s.text}>
                {p}
              </p>
            ))}
            <p className={s.sign}>{name}</p>
          </section>

          {items.map((it, i) => (
            <section key={it.key} className={s.sec}>
              <span className={s.holes} aria-hidden="true" />
              <header className={s.secHead}>
                <b>{String(i + 1).padStart(2, '0')}</b>
                <span>{it.kicker}</span>
              </header>
              <h2 className={s.secTitle}>{it.title}</h2>
              {it.body}
            </section>
          ))}

          {blocks.explore}
        </div>
      </Gate>
    </main>
  );
}
