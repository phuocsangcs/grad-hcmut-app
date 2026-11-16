'use client';

import type { ReactNode } from 'react';
import { cx } from '../cx';
import { Icon, type IconName } from './Icon';
import s from './FormSection.module.css';

type Props = {
  id: string;
  title: string;
  icon: IconName;
  /** Mô tả ngắn dưới tiêu đề khi đang thu gọn. */
  hint?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Có truyền → hiện công tắc bật/tắt. Tắt thì mục thu gọn và không được dùng. */
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  /** Chữ cạnh công tắc, ví dụ "Hiện trên thiệp". */
  switchLabel?: string;
  /** Chữ cạnh công tắc khi đang tắt. Mặc định suy ra từ switchLabel (Hiện→Ẩn, Bật→Tắt…). */
  switchOffLabel?: string;
  /** Khi tắt mà xổ ra xem: hiện câu này thay cho các ô nhập. */
  offNote?: string;
  children: ReactNode;
  className?: string;
};

const OFF_LABELS: Record<string, string> = { Hiện: 'Ẩn', Bật: 'Tắt', Nhận: 'Không nhận', 'Tự viết': 'Mặc định' };

/**
 * Một khối của form: tiêu đề bấm để xổ xuống, kèm công tắc bật/tắt (tuỳ chọn).
 * Mục bắt buộc thì không truyền `enabled`, không có công tắc.
 */
export function FormSection({ id, title, icon, hint, open, onOpenChange, enabled, onEnabledChange, switchLabel, switchOffLabel, offNote, children, className }: Props) {
  const hasSwitch = enabled !== undefined && !!onEnabledChange;
  const off = hasSwitch && !enabled;
  return (
    <section className={cx(s.card, className)} data-open={open} data-off={off}>
      <div className={s.head}>
        <button type="button" className={s.headBtn} aria-expanded={open} aria-controls={`${id}-body`} onClick={() => onOpenChange(!open)}>
          <Icon name="chevron" size={18} className={s.chev} />
          <Icon name={icon} size={18} className={s.icon} />
          <span className={s.titles}>
            <span className={s.title}>{title}</span>
            {hint && !open ? <span className={s.hint}>{hint}</span> : null}
          </span>
        </button>
        {hasSwitch ? (
          <span className={s.switchWrap}>
            {switchLabel ? <span className={s.switchLabel}>{enabled ? switchLabel : switchOffLabel ?? OFF_LABELS[switchLabel] ?? 'Tắt'}</span> : null}
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label={`${title}: ${enabled ? 'đang bật' : 'đang tắt'}`}
              className={s.switch}
              onClick={() => onEnabledChange!(!enabled)}
            />
          </span>
        ) : null}
      </div>
      <div id={`${id}-body`} className={s.body} hidden={!open}>
        {off && offNote ? <p className={s.offNote}>{offNote}</p> : children}
      </div>
    </section>
  );
}
