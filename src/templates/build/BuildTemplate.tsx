import type { TemplateProps } from '../types';
import { facultyVars } from '../shared/vars';
import { CAMPUS } from '../shared/campus';
import { dateParts, firstName, paragraphs } from '../shared/date';
import { Gate, GateSkip } from '../shared/Gate';
import { sectionList } from '../shared/sections';
import { BuildStack } from './BuildStack';
import s from './build.module.css';

/**
 * NGHIỆM THU CÔNG TRÌNH — công trường với cần cẩu tháp.
 * Bấm Xây 4 lần: mỗi tầng là một năm học rơi xuống đúng chỗ, cắm cờ Tốt nghiệp, rồi Nghiệm thu.
 * Bên trong là bảng thông tin công trình xanh dương kiểu Việt Nam: chủ đầu tư là người được mời.
 */
export function BuildTemplate({ card, faculty, blocks, message, inviteLead, inviteeName }: TemplateProps) {
  const d = dateParts(card.ceremonyAt);
  const name = firstName(card.displayName);
  const items = sectionList(blocks, {
    ceremony: { kicker: 'Lễ nghiệm thu' },
    rsvp: { kicker: 'Chủ đầu tư xác nhận', title: `${inviteeName} có mặt chứ?` },
    meeting: { kicker: 'Tập kết sau lễ' },
    route: { kicker: 'Đường vào công trường' },
  });

  const cover = (
    <div className={s.coverInner}>
      <header className={s.coverHead}>
        <p className={s.kicker}>Công trường Bách Khoa · Khởi công 4 năm trước</p>
        <h1 className={s.coverName}>{card.displayName}</h1>
        <p className={s.coverSub}>
          {faculty.degreeTitle} · {d.weekdayShort} {d.day}.{d.month}.{d.year} · {d.clock}
        </p>
      </header>
      <BuildStack flag="Tốt nghiệp" />
      <GateSkip className={s.skip} />
    </div>
  );

  return (
    <main className={s.root} style={facultyVars(faculty)}>
      <Gate className={s.gate} cover={cover} duration={900} exit="fade" label="Bìa thiệp: công trường">
        <header className={s.hero}>
          <div className={s.board}>
            <p className={s.boardTitle}>Bảng thông tin công trình</p>
            <dl className={s.boardList}>
              <div>
                <dt>Tên công trình</dt>
                <dd>Lễ tốt nghiệp của {card.displayName}</dd>
              </div>
              <div>
                <dt>Chủ đầu tư</dt>
                <dd>{inviteeName}</dd>
              </div>
              <div>
                <dt>Đơn vị thi công</dt>
                <dd>
                  {card.displayName} · {faculty.degreeTitle}
                </dd>
              </div>
              <div>
                <dt>Đơn vị giám sát</dt>
                <dd>Thầy Cô {faculty.name}</dd>
              </div>
              <div>
                <dt>Thời gian thi công</dt>
                <dd>4 năm (đúng tiến độ)</dd>
              </div>
              <div>
                <dt>Ngày nghiệm thu</dt>
                <dd>
                  {d.clock} · {d.weekdayLong}, {d.day}.{d.month}.{d.year}
                </dd>
              </div>
              <div>
                <dt>Địa điểm</dt>
                <dd>{card.venue} · Trường ĐH Bách Khoa</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className={s.body}>
          {blocks.after}

          <section className={s.sec}>
            <p className={s.secKicker}>Văn bản mời nghiệm thu</p>
            <p className={s.to}>
              {inviteLead} <b>{inviteeName}</b>,
            </p>
            {paragraphs(message).map((p, i) => (
              <p key={i} className={s.text}>
                {p}
              </p>
            ))}
            <p className={s.sign}>— {name}, chỉ huy trưởng</p>
          </section>

          <figure className={s.photo}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh của mẫu */}
            <img src={CAMPUS.b9.src} alt={CAMPUS.b9.alt} loading="lazy" decoding="async" />
            <figcaption>Công trình mẫu · {CAMPUS.b9.place}</figcaption>
          </figure>

          {items.map((it, i) => (
            <section key={it.key} className={s.sec}>
              <p className={s.secKicker}>
                Hạng mục {String(i + 1).padStart(2, '0')} · {it.kicker}
              </p>
              <h2 className={s.secTitle}>{it.title}</h2>
              {it.body}
            </section>
          ))}

          <p className={s.safety}>⛑ An toàn là bạn · Tai nạn là thù · Tốt nghiệp là vui</p>
          <div className={s.sec}>{blocks.explore}</div>
        </div>
      </Gate>
    </main>
  );
}
