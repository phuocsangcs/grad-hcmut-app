import type { PublicCard } from '@/modules/card';
import { listPoisByType, type Faculty, type Poi, type PoiType } from '@/modules/content';
import { poiSearchUrl } from '@/modules/share/maps-link';
import { formatTimeVi } from '@/lib/time';
import { Button, Icon, type IconName } from '@/ui';
import type { TemplateBlocks, TemplateLinks } from '../types';
import { Countdown } from './Countdown';
import s from './dayof.module.css';

type Props = { card: PublicCard; faculty: Faculty; links: TemplateLinks; blocks: TemplateBlocks; preview?: boolean };

const POI_ORDER: { type: PoiType; icon: IconName }[] = [
  { type: 'restroom', icon: 'restroom' },
  { type: 'parking', icon: 'parking' },
  { type: 'water', icon: 'water' },
  { type: 'rest', icon: 'tree' },
  { type: 'photo', icon: 'camera' },
];

/**
 * Chế độ NGÀY LỄ – dùng chung cho mọi template.
 * Cố ý ít trang trí, nhiều chỉ dẫn: giờ, điểm hẹn, gọi, chỉ đường, WC, gửi xe.
 * Màu nhấn vẫn lấy theo khoa để liền mạch với thiệp.
 */
export function DayOfView({ card, faculty, links, blocks, preview }: Props) {
  const at = new Date(card.ceremonyAt);
  const groups = POI_ORDER.map((g) => ({ ...g, items: listPoisByType(g.type) })).filter((g) => g.items.length);
  return (
    <main className={s.root} style={{ '--t-accent': faculty.accent, '--t-soft': faculty.soft } as React.CSSProperties} data-mode="dayof">
      <header className={s.hero}>
        <span className={s.today}>
          <span className={s.pulse} aria-hidden="true" />
          Hôm nay
        </span>
        <h1>
          <span>Lễ của {card.displayName}</span>
          <span>bắt đầu lúc {formatTimeVi(at)}</span>
        </h1>
        <p>
          {card.venue} · <Countdown ceremonyAt={card.ceremonyAt} initial={card.countdown} variant="inline" />
        </p>
      </header>

      <div className={s.body}>
        {card.meeting ? (
          <section className={s.meeting}>
            {card.meeting.poi.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh trong public/
              <img src={card.meeting.poi.image} alt={card.meeting.poi.name} className={s.meetingImg} />
            ) : (
              <div className={s.meetingPlaceholder} aria-hidden="true">
                <Icon name="pin" size={32} />
              </div>
            )}
            <div className={s.meetingBody}>
              <span className={s.tag}>Điểm hẹn</span>
              <b>{card.meeting.poi.name}</b>
              <span>
                {card.meeting.time ? `Gặp nhau lúc ${card.meeting.time}` : 'Gặp nhau sau khi nhận bằng'}
                {card.meeting.note ? ` · ${card.meeting.note}` : ''}
              </span>
            </div>
          </section>
        ) : null}

        {/* Giờ đón khách / gặp sau lễ: đúng ngày lễ càng cần thấy. */}
        {blocks.times}

        <div className={s.primary}>
          <Button href={links.directions} target="_blank" size="lg" leading={<Icon name="pin" size={18} />}>
            Chỉ đường
          </Button>
          {links.call ? (
            <Button href={links.call} size="lg" variant="secondary" leading={<Icon name="phone" size={18} />}>
              Gọi điện
            </Button>
          ) : (
            <Button href={links.googleCalendar} target="_blank" size="lg" variant="secondary" leading={<Icon name="calendar" size={18} />}>
              Lịch
            </Button>
          )}
        </div>

        {blocks.rsvp ? <div className={s.rsvp}>{blocks.rsvp}</div> : null}

        <h2 className={s.h2}>Gần {card.venue}</h2>
        <ul className={s.grid}>
          {groups.flatMap((g) =>
            g.items.slice(0, 2).map((p: Poi) => (
              <li key={p.id}>
                <a href={preview ? '#' : poiSearchUrl(p)} target={preview ? undefined : '_blank'} rel="noreferrer" className={s.poi}>
                  <Icon name={g.icon} size={22} />
                  <b>{p.name}</b>
                  {p.note ? <small>{p.note}</small> : null}
                </a>
              </li>
            )),
          )}
        </ul>

        <section className={s.photoTip}>
          <Icon name="camera" size={22} />
          <span>
            <b>Góc chụp ảnh đẹp</b>
            <small>Bảng tên trường trước giờ lễ (tan lễ rất đông) · bậc thềm A5 · nắng xiên đẹp nhất 16h–17h.</small>
          </span>
        </section>

        {blocks.explore}
      </div>
    </main>
  );
}
