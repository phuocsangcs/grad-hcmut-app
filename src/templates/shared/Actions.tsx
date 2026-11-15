import { Button, Icon } from '@/ui';
import type { TemplateLinks } from '../types';
import s from './blocks.module.css';

type Props = { links: TemplateLinks; displayName: string; layout?: 'row' | 'grid' };

/** Hàng nút hành động: chỉ đường, thêm lịch, gọi. Dùng chung cho mọi template. */
export function Actions({ links, displayName, layout = 'grid' }: Props) {
  return (
    <div className={layout === 'grid' ? s.actionsGrid : s.actionsRow}>
      <Button href={links.directions} target="_blank" variant="secondary" leading={<Icon name="pin" size={18} />}>
        Chỉ đường đến trường
      </Button>
      <Button href={links.googleCalendar} target="_blank" variant="secondary" leading={<Icon name="calendar" size={18} />}>
        Thêm vào lịch
      </Button>
      {links.call ? (
        <Button href={links.call} variant="secondary" leading={<Icon name="phone" size={18} />}>
          Gọi {displayName}
        </Button>
      ) : null}
      <a className={s.inlineLink} href={links.ics}>
        Tải file lịch (.ics) cho iPhone <Icon name="download" size={14} />
      </a>
    </div>
  );
}
