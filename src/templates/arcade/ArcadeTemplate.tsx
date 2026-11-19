import type { CSSProperties } from 'react';
import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { dateParts, firstName, paragraphs } from '../shared/date';
import { Gate, GateButton } from '../shared/Gate';
import { Portrait } from '../shared/Portrait';
import { sectionList } from '../shared/sections';
import s from './arcade.module.css';

/** Mũ cử nhân 8-bit: mỗi ký tự là một ô (k = đen, b = xanh, y = vàng). */
const CAP = [
  '.......kk.......',
  '.....kkkkkk.....',
  '...kkkkkkkkkk...',
  '.kkkkkkkyykkkkk.',
  'kkkkkkkkkkkkkkyk',
  '..kkkkkkkkkkk.y.',
  '...bbbbbbbbbb.y.',
  '...bbbbbbbbbb.y.',
  '...bbbbbbbbbb.y.',
  '....bbbbbbbb.yyy',
  '.............yyy',
];
const COLORS: Record<string, string> = { k: '#1b2552', b: '#1488db', y: '#f4b740' };

function PixelCap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${CAP[0].length} ${CAP.length}`} shapeRendering="crispEdges" aria-hidden="true">
      {CAP.flatMap((row, y) => [...row].map((c, x) => (c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={COLORS[c]} />)))}
    </svg>
  );
}

const STATS = [
  { label: 'Kiến thức', value: 100, text: '100/100' },
  { label: 'Đồ án', value: 100, text: 'HOÀN THÀNH' },
  { label: 'Cà phê', value: 96, text: '999+ ly' },
  { label: 'Giấc ngủ', value: 14, text: '14%' },
];

/**
 * MÀN CHƠI CUỐI — trò chơi 8-bit "Bách Khoa Quest".
 * Nhấn START: thanh tải 4 năm chạy qua từng năm học, LEVEL UP!, rồi vào màn chơi:
 * thẻ nhân vật, chỉ số, thành tựu mở khoá, nhiệm vụ cuối (có mặt ở lễ), mời đồng đội (RSVP).
 */
export function ArcadeTemplate({ card, faculty, blocks, message, coverPhoto, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const items = sectionList(blocks, {
    gallery: { kicker: 'Ảnh chụp màn hình', title: 'Khoảnh khắc trong game' },
    ceremony: { kicker: 'Nhiệm vụ cuối', title: 'Có mặt ở Lễ tốt nghiệp' },
    rsvp: { kicker: 'Mời đồng đội', title: `${inviteeName} tham gia chứ?` },
    guestbook: { kicker: 'Bảng vàng', title: 'Lời chúc của người chơi' },
    meeting: { kicker: 'Điểm hồi sinh', title: 'Tụ họp sau lễ' },
    route: { kicker: 'Bản đồ', title: 'Đường tới màn chơi' },
  });
  const achievements = ['Sống sót qua Giải tích 1', 'Thức trắng mùa thi cuối kỳ', 'Đủ tín chỉ, không nợ môn', 'Bảo vệ đồ án thành công', `Mở khoá danh hiệu: ${faculty.degreeTitle}`];

  const cover = (
    <div className={s.crt}>
      <div className={s.screen}>
        <p className={s.coin}>Credit 01 · {d.year}</p>
        <PixelCap className={s.capSprite} />
        <h1 className={s.title}>
          <span>Bách Khoa</span>
          <span>Quest</span>
        </h1>
        <p className={s.stage}>Final stage · Lễ tốt nghiệp</p>
        <dl className={s.players}>
          <div>
            <dt>1P</dt>
            <dd>{card.displayName}</dd>
          </div>
          <div>
            <dt>2P</dt>
            <dd>{inviteeName}</dd>
          </div>
        </dl>
        <p className={s.blink}>▶ Nhấn START để chơi</p>

        <div className={s.loading} aria-hidden="true">
          <p className={s.loadText}>Đang tải 4 năm…</p>
          <div className={s.loadBar}>
            <i />
          </div>
          <ol className={s.loadYears}>
            <li>Năm 1</li>
            <li>Năm 2</li>
            <li>Năm 3</li>
            <li>Năm 4</li>
          </ol>
          <p className={s.levelUp}>Level up!</p>
        </div>
      </div>
      <div className={s.cabinet}>
        <span className={s.stick} aria-hidden="true" />
        <GateButton className={s.start}>Start</GateButton>
        <span className={s.btnB} aria-hidden="true" />
      </div>
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={2800} exit="fade" label="Bìa thiệp: trò chơi 8-bit">
        <header className={s.hud}>
          <span>
            HP <b>♥♥♥</b>
          </span>
          <span>
            LV <b>{d.year}</b>
          </span>
          <span>
            Xu <b>140 TC</b>
          </span>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.panel} data-tone="player">
            <p className={s.kicker}>Người chơi 1</p>
            <div className={s.player}>
              <Portrait src={coverPhoto} name={card.displayName} className={s.avatar} priority />
              <div>
                <h2 className={s.pName}>{card.displayName}</h2>
                <p className={s.pClass}>
                  Lớp nhân vật: <b>{faculty.degreeTitle}</b>
                </p>
                <p className={s.pClass}>Hệ phái: {faculty.name}</p>
              </div>
            </div>
            <ul className={s.stats}>
              {STATS.map((st) => (
                <li key={st.label}>
                  <span>{st.label}</span>
                  <span className={s.statBar} style={{ '--v': `${st.value}%` } as CSSProperties}>
                    <i />
                  </span>
                  <b>{st.text}</b>
                </li>
              ))}
            </ul>
          </section>

          <section className={s.panel}>
            <p className={s.kicker}>Thông báo từ người chơi</p>
            <p className={s.say}>
              {inviteLead} <b>{inviteeName}</b>!
            </p>
            {paragraphs(message).map((p, i) => (
              <p key={i} className={s.text}>
                {p}
              </p>
            ))}
            <p className={s.signoff}>— {name}, 1P</p>
          </section>

          <section className={s.panel}>
            <p className={s.kicker}>Thành tựu đã mở khoá</p>
            <ol className={s.achieve}>
              {achievements.map((a, i) => (
                <li key={a} style={{ '--i': i } as CSSProperties}>
                  <span aria-hidden="true">★</span>
                  {a}
                </li>
              ))}
            </ol>
          </section>

          {items.map((it) => (
            <section key={it.key} className={s.panel} data-tone={it.key === 'ceremony' ? 'quest' : undefined}>
              <p className={s.kicker}>{it.kicker}</p>
              <h3 className={s.pTitle}>{it.title}</h3>
              {it.body}
            </section>
          ))}

          <p className={s.credits}>Game over? Không, đây mới là màn 1 · Cảm ơn đã chơi!</p>
          <div className={s.panel}>{blocks.explore}</div>
        </div>
      </Gate>
    </main>
  );
}
