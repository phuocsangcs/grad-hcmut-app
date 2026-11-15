import type { PublicCard } from '@/modules/card';
import { Icon } from '@/ui';
import s from './blocks.module.css';

type Props = { meeting: NonNullable<PublicCard['meeting']>; mapsUrl: string | null; compact?: boolean };

/** Điểm hẹn sau lễ: tên chỗ, giờ, ghi chú, ảnh thật nếu có. */
export function MeetingPoint({ meeting, mapsUrl, compact }: Props) {
  const { poi, time, note } = meeting;
  return (
    <section className={s.meeting} aria-labelledby="meeting-title">
      {poi.image && !compact ? (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh trong public/, kích thước tự do
        <img className={s.meetingImg} src={poi.image} alt={poi.name} loading="lazy" />
      ) : null}
      <div className={s.meetingBody}>
        <span className={s.tag}>
          <Icon name="pin" size={14} /> Điểm hẹn sau lễ
        </span>
        <h3 id="meeting-title" className={s.meetingName}>
          {poi.name}
        </h3>
        <p className={s.meetingMeta}>
          {time ? <b>{time}</b> : null}
          {time && (note || poi.note) ? ' · ' : null}
          {note ?? poi.note}
        </p>
        {mapsUrl ? (
          <a className={s.inlineLink} href={mapsUrl} target="_blank" rel="noreferrer">
            Xem trên bản đồ <Icon name="external" size={14} />
          </a>
        ) : null}
      </div>
    </section>
  );
}
