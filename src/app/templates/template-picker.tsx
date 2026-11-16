'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@/ui';
import s from './templates.module.css';

export type PickerItem = {
  id: string;
  /** Mẫu có chỗ đặt ảnh bìa. */
  cover: boolean;
  name: string;
  description: string;
  /** Xem trước nhỏ trong lưới (server render sẵn). */
  thumb: ReactNode;
  /** Xem trước lớn trong hộp xác nhận. */
  large: ReactNode;
};

/**
 * Lưới mẫu thiệp. Bấm một mẫu → hộp xác nhận (kính mờ) → "Dùng mẫu này" mới sang trang nhập thông tin.
 */
export function TemplatePicker({ items }: { items: PickerItem[] }) {
  const router = useRouter();
  const [picked, setPicked] = useState<PickerItem | null>(null);
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
      {[
        { title: 'Có ảnh bìa', sub: 'Có chỗ đặt ảnh của bạn (ví dụ ảnh kỷ yếu) ngay đầu thiệp.', list: items.filter((t) => t.cover) },
        { title: 'Không cần ảnh', sub: 'Chữ và hình vẽ theo khoa, không phải chuẩn bị ảnh.', list: items.filter((t) => !t.cover) },
      ].map((g) => (
        <section key={g.title} className={s.group} aria-label={g.title}>
          <h2 className={s.groupTitle}>{g.title}</h2>
          <p className={s.groupSub}>{g.sub}</p>
          <ul className={s.grid}>
            {g.list.map((t) => (
              <li key={t.id} className={s.card}>
                <div className={s.thumb} aria-hidden="true">{t.thumb}</div>
                <div className={s.cardBody}>
                  <h3 className={s.cardName}>{t.name}</h3>
                  <p className={s.cardDesc}>{t.description}</p>
                </div>
                {/* Nút phủ kín thẻ: thẻ chứa bản xem trước có nút thật nên không thể bọc bằng button. */}
                <button type="button" className={s.hit} onClick={() => open(t)} aria-label={`Chọn mẫu ${t.name}`} />
              </li>
            ))}
          </ul>
        </section>
      ))}

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
                <Button variant="ghost" onClick={close}>Chọn mẫu khác</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
