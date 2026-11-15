import s from './extras.module.css';

/** Giờ đón khách (trước lễ) và giờ gặp sau lễ. Chủ thiệp không điền thì không hiện gì. */
export function TimesInfo({ beforeTime, afterTime }: { beforeTime: string | null; afterTime: string | null }) {
  if (!beforeTime && !afterTime) return null;
  return (
    <dl className={s.times}>
      {beforeTime ? (
        <div>
          <dt>Trước lễ</dt>
          <dd>{beforeTime}</dd>
          <small>Đón khách, ổn định chỗ ngồi</small>
        </div>
      ) : null}
      {afterTime ? (
        <div>
          <dt>Sau lễ</dt>
          <dd>{afterTime}</dd>
          <small>Chụp ảnh, gặp gỡ</small>
        </div>
      ) : null}
    </dl>
  );
}
