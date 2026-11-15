import { formatDateVi } from '@/lib/time';
import { Icon } from '@/ui';
import s from './blocks.module.css';

/** Sau ngày lễ: lời cảm ơn + ngày tự xoá. */
export function After({ displayName, expiresAt }: { displayName: string; expiresAt: string }) {
  return (
    <section className={s.after}>
      <Icon name="heart" size={26} />
      <h3>Cảm ơn mọi người đã đến chung vui với {displayName}</h3>
      <p>Thiệp này sẽ tự xoá vào ngày {formatDateVi(new Date(expiresAt))}. Ảnh và kỷ niệm thì giữ mãi nhé.</p>
    </section>
  );
}
