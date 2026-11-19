import type { CSSProperties, ReactNode } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, firstName, paragraphs } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { sectionList, type SectionKey } from '../shared/sections';
import { EnterKey } from './EnterKey';
import s from './terminal.module.css';

const FILES: Record<SectionKey, string> = {
  gallery: 'anh/',
  ceremony: 'le-tot-nghiep.ts',
  rsvp: 'xac-nhan.tsx',
  guestbook: 'luu-but.log',
  meeting: 'diem-hen.json',
  route: 'duong-di.md',
};

function Line({ i, children, kind }: { i: number; children: ReactNode; kind?: 'cmd' | 'ok' | 'info' }) {
  return (
    <p className={s.line} data-kind={kind} style={{ '--i': i } as CSSProperties}>
      {children}
    </p>
  );
}

/**
 * BUILD PASSED — cửa sổ dòng lệnh tự gõ `./tot-nghiep`, chạy kiểm tra tín chỉ, đồ án… rồi báo Build passed.
 * Bấm "Enter" (hoặc phím Enter): deploy thiệp. Bên trong như trình soạn mã nhưng chữ to, nền sáng ở phần cần đọc.
 */
export function TerminalTemplate({ card, faculty, blocks, message, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const items = sectionList(blocks);
  const cmd = `./tot-nghiep --moi "${inviteeName}"`;

  const cover = (
    <div className={s.desk}>
      <EnterKey />
      <div className={s.win}>
        <div className={s.titlebar} aria-hidden="true">
          <i />
          <i />
          <i />
          <span>bach-khoa — zsh</span>
        </div>
        <div className={s.term}>
          <p className={s.line} data-kind="cmd" style={{ '--i': 0 } as CSSProperties}>
            <span className={s.prompt}>~/bach-khoa $</span>{' '}
            <span className={s.typed} style={{ '--n': cmd.length } as CSSProperties}>
              {cmd}
            </span>
          </p>
          <Line i={1}>▸ Kiểm tra tín chỉ ........ 140/140 ✓</Line>
          <Line i={2}>▸ Đồ án tốt nghiệp ........ đã bảo vệ ✓</Line>
          <Line i={3}>▸ Nợ môn .................. 0 ✓</Line>
          <Line i={4}>▸ Cà phê đã uống .......... vô số ☕</Line>
          <Line i={5} kind="ok">
            ✓ Build passed sau 4 năm
          </Line>
          <Line i={6} kind="info">
            {card.displayName} · {faculty.degreeTitle}
          </Line>
          <Line i={7} kind="info">
            Lễ: {d.weekdayShort} {d.day}.{d.month}.{d.year} · {d.clock} · {card.venue}
          </Line>
          <Line i={8}>Sẵn sàng deploy tới: {inviteeName}</Line>
          <p className={s.deploy} aria-hidden="true">
            Deploying… <span className={s.bar} /> <b>100%</b>
          </p>
        </div>
      </div>
      <GateButton className={s.enter}>
        <kbd>⏎</kbd> Nhấn Enter để mở thiệp
      </GateButton>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={1500} exit="zoom" label="Bìa thiệp: dòng lệnh">
        <header className={s.top}>
          <div className={s.tabs} aria-hidden="true">
            <span data-active="">thu-moi.md</span>
            <span>README.md</span>
          </div>
          <div className={s.hero}>
            <p className={s.comment}>{`// ${faculty.tagline}`}</p>
            <h1 className={s.name}>{card.displayName}</h1>
            <p className={s.decl}>
              <span className={s.kw}>const</span> <span className={s.var}>role</span> = <span className={s.str}>&quot;{faculty.degreeTitle}&quot;</span>;
            </p>
            <p className={s.decl}>
              <span className={s.kw}>const</span> <span className={s.var}>khoa</span> = <span className={s.str}>&quot;{faculty.name}&quot;</span>;
            </p>
            <p className={s.decl}>
              <span className={s.kw}>await</span> <span className={s.fn}>leTotNghiep</span>({'{'} <span className={s.var}>ngay</span>: <span className={s.str}>&quot;{d.day}.{d.month}.{d.year}&quot;</span>, <span className={s.var}>gio</span>: <span className={s.str}>&quot;{d.clock}&quot;</span> {'}'});
            </p>
          </div>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.file}>
            <header className={s.fileHead}>
              <span>thu-moi.md</span>
              <small>markdown</small>
            </header>
            <div className={s.md}>
              <p className={s.h}># Thư mời</p>
              <p className={s.to}>
                {inviteLead} <b>{inviteeName}</b>,
              </p>
              {paragraphs(message).map((p, i) => (
                <p key={i} className={s.text}>
                  {p}
                </p>
              ))}
              <p className={s.sign}>
                — <b>{name}</b> <span className={s.commit}>commit {d.year}{d.month}{d.day}</span>
              </p>
            </div>
          </section>

          <figure className={s.shot}>
            <header className={s.fileHead}>
              <span>khuon-vien.jpg</span>
              <small>{CAMPUS.libraryFront.place}</small>
            </header>
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh của mẫu */}
            <img src={CAMPUS.libraryFront.src} alt={CAMPUS.libraryFront.alt} loading="lazy" decoding="async" />
          </figure>

          {items.map((it) => (
            <section key={it.key} className={s.file}>
              <header className={s.fileHead}>
                <span>{FILES[it.key]}</span>
                <small>{it.kicker}</small>
              </header>
              <div className={s.md}>
                <h2 className={s.fileTitle}>{it.title}</h2>
                {it.body}
              </div>
            </section>
          ))}

          <section className={s.file}>
            <div className={s.md}>{blocks.explore}</div>
          </section>
          <p className={s.status}>
            <span>● main</span>
            <span>✓ 0 lỗi · 0 cảnh báo</span>
            <span>UTF-8</span>
          </p>
        </div>
      </Gate>
    </main>
  );
}
