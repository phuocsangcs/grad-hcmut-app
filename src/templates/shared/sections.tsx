import type { ReactNode } from 'react';
import { poisFile } from '@/modules/content';
import type { TemplateBlocks } from '../types';
import s from './sections.module.css';

export type SectionKey = 'gallery' | 'ceremony' | 'rsvp' | 'guestbook' | 'meeting' | 'route';
export type SectionItem = { key: SectionKey; kicker: string; title: string; body: ReactNode };
type Labels = Partial<Record<SectionKey, { kicker?: string; title?: string }>>;

const DEFAULTS: Record<SectionKey, { kicker: string; title: string }> = {
  gallery: { kicker: 'Kỷ niệm', title: 'Vài tấm ảnh' },
  ceremony: { kicker: 'Buổi lễ', title: 'Lễ trao bằng tốt nghiệp' },
  rsvp: { kicker: 'Xác nhận', title: 'Bạn sẽ đến chứ?' },
  guestbook: { kicker: 'Lời chúc', title: 'Sổ lưu bút' },
  meeting: { kicker: 'Điểm hẹn', title: 'Gặp nhau sau lễ' },
  route: { kicker: 'Đường đến', title: poisFile.campus.name },
};

/**
 * Danh sách mục nội dung chuẩn (đã bỏ mục trống), theo đúng thứ tự đọc của người nhận.
 * Mẫu tự vẽ khung từng mục; chỉ cần map qua mảng này.
 * `blocks.after` (lời cảm ơn sau lễ) không nằm trong danh sách — mẫu đặt riêng ở đầu.
 */
export function sectionList(blocks: TemplateBlocks, labels: Labels = {}, opts: { countdown?: boolean } = {}): SectionItem[] {
  const L = (k: SectionKey) => ({ ...DEFAULTS[k], ...labels[k] });
  const items: (SectionItem | null)[] = [
    blocks.gallery ? { key: 'gallery', ...L('gallery'), body: blocks.gallery } : null,
    {
      key: 'ceremony',
      ...L('ceremony'),
      body: (
        <>
          {blocks.ceremony}
          {blocks.times}
          {opts.countdown === false ? null : (
            <>
              <p className={s.mini}>Đếm ngược tới giờ lễ</p>
              {blocks.countdown}
            </>
          )}
        </>
      ),
    },
    blocks.rsvp ? { key: 'rsvp', ...L('rsvp'), body: blocks.rsvp } : null,
    blocks.guestbook ? { key: 'guestbook', ...L('guestbook'), body: blocks.guestbook } : null,
    blocks.meeting ? { key: 'meeting', ...L('meeting'), body: blocks.meeting } : null,
    {
      key: 'route',
      ...L('route'),
      body: (
        <>
          <p className={s.address}>{poisFile.campus.address}</p>
          {blocks.actions}
        </>
      ),
    },
  ];
  return items.filter((x): x is SectionItem => x !== null);
}
