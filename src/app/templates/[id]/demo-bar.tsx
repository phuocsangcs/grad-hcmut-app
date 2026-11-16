'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/ui';
import s from './demo.module.css';

type Props = {
  templateId: string;
  templateName: string;
  facultyId: string;
  faculties: { id: string; name: string }[];
};

/** Thanh mỏng trên đầu trang demo: quay lại, đổi khoa, dùng mẫu này. */
export function DemoBar({ templateId, templateName, facultyId, faculties }: Props) {
  const router = useRouter();
  return (
    <div className={s.bar} role="region" aria-label="Đang xem demo">
      <Link href="/templates" className={s.back} aria-label="Quay lại chọn mẫu">
        <Icon name="arrow" size={16} />
      </Link>
      <span className={s.title}>
        <small>Demo</small>
        <b>{templateName}</b>
      </span>
      <label className={s.faculty}>
        <span className="sr-only">Xem theo khoa</span>
        <select value={facultyId} onChange={(e) => router.replace(`/templates/${templateId}?faculty=${e.target.value}`, { scroll: false })}>
          {faculties.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      <Link href={`/create?template=${encodeURIComponent(templateId)}`} className={s.use}>
        Dùng mẫu này
      </Link>
    </div>
  );
}
