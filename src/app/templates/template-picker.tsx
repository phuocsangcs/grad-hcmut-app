'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@/ui';
import s from './templates.module.css';

export type PickerItem = {
  id: string;
  /** Mẫu có chỗ đặt ảnh bìa. */
  cover: boolean;
  /** Bộ sưu tập: bk | creative | major | classic. */
  collection: string;
  name: string;
  description: string;
  /** Xem trước nhỏ trong lưới (server render sẵn). */
  thumb: ReactNode;
  /** Xem trước lớn trong hộp xác nhận. */
  large: ReactNode;
};

type Filter = 'all' | 'bk' | 'creative' | 'major' | 'classic';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'bk', label: 'Sắc màu Bách Khoa' },
  { id: 'creative', label: 'Sáng tạo' },
  { id: 'major', label: 'Theo ngành' },
  { id: 'classic', label: 'Bộ đầu tiên' },
];
const match = (t: PickerItem, f: Filter) => f === 'all' || t.collection === f;

/**
 * Lưới mẫu thiệp, lọc theo bộ sưu tập (Sắc BK, Sáng tạo, Theo ngành, Bộ đầu tiên). Bấm một mẫu → hộp xác nhận (kính mờ) → "Dùng mẫu này" mới sang trang nhập thông tin.
 */
export function TemplatePicker({ items }: { items: PickerItem[] }) {
  const router = useRouter();
  const [picked, setPicked] = useState<PickerItem | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const count = (f: Filter) => items.filter((t) => match(t, f)).length;
  const list = items.filter((t) => match(t, filter));
  const confirmRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setPicked(null);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (!picked) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [picked, close]);

  function open(item: PickerItem) {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setPicked(item);
  }

  return (
    <>
      <div className={s.filters} role="group" aria-label="Lọc mẫu thiệp">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={s.filter} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
            <span className={s.filterCount}>{count(f.id)}</span>
          </button>
        ))}
      </div>

      <ul className={s.grid} aria-label="Danh sách mẫu">
        {list.map((t) => (
          <li key={t.id} className={s.card}>
            <div className={s.thumb} aria-hidden="true">{t.thumb}</div>
            <div className={s.cardBody}>
              <h2 className={s.cardName}>
                {t.name}
                {t.cover ? <span className={s.badge}>Có ảnh</span> : null}
              </h2>
              <p className={s.cardDesc}>{t.description}</p>
              <Link href={`/templates/${t.id}`} className={s.demoLink}>
                <Icon name="eye" size={14} /> Xem demo
              </Link>
            </div>
            {/* Nút phủ kín thẻ: thẻ chứa bản xem trước có nút thật nên không thể bọc bằng button. */}
            <button type="button" className={s.hit} onClick={() => open(t)} aria-label={`Chọn mẫu ${t.name}`} />
          </li>
        ))}
      </ul>

      {picked && (
        <div className={s.backdrop} onClick={close}>
          <div
            className={s.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={s.modalPreview} aria-hidden="true">{picked.large}</div>
            <div className={s.modalBody}>
              <h2 id="confirm-title" className={s.modalTitle}>Dùng mẫu “{picked.name}”?</h2>
              <p className={s.modalDesc}>{picked.description}</p>
              <p className={s.modalNote}>Màu và hoạ tiết tự đổi theo khoa của bạn. Muốn đổi mẫu khác sau này, thông tin đã nhập vẫn được giữ.</p>
              <div className={s.modalActions}>
                <button
                  ref={confirmRef}
                  type="button"
                  className={s.confirm}
                  onClick={() => router.push(`/create?template=${encodeURIComponent(picked.id)}`)}
                >
                  Dùng mẫu này <Icon name="arrow" size={16} />
                </button>
                <Button href={`/templates/${picked.id}`} variant="secondary" leading={<Icon name="eye" size={16} />}>Xem demo</Button>
                <Button variant="ghost" onClick={close}>Chọn mẫu khác</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
