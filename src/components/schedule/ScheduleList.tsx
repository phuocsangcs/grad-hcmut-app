import { scheduleByDay } from '@/modules/content';
import s from './schedule.module.css';

/** Thông báo chính thức của Trường về Lễ tốt nghiệp tháng 11/2026 (đã bỏ tham số theo dõi fbclid). */
export const OFFICIAL_NOTICE_URL = 'https://hcmut.edu.vn/tintuc/thong-bao-to-chuc-le-tot-nghiep-thang-11-nam-2026';

/**
 * Lịch lễ theo khoa dạng bảng trơn: mỗi ngày một hàng, trong đó là giờ + tên khoa.
 * Dùng chung cho trang chủ và trang Lịch theo khoa (/guide).
 */
export function ScheduleList() {
  return (
    <dl className={s.days}>
      {scheduleByDay().map((d) => (
        <div key={d.date} className={s.day}>
          <dt className={s.dayLabel}>
            <b>
              {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
            </b>
            <span>{d.label.replace(/,.*$/, '')}</span>
          </dt>
          <dd className={s.dayItems}>
            {d.items.map((f) => (
              <span key={f.id} className={s.dayItem}>
                <span className={s.dayTime}>{f.time}</span>
                <span>{f.name}</span>
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
