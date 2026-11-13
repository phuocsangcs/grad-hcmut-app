import { listGreetingGroups } from '@/modules/content';
import { DoneView } from './done-view';

export const metadata = { title: 'Thiệp đã tạo' };

export default function DonePage() {
  return <DoneView groups={listGreetingGroups().map((g) => ({ key: g.key, label: g.label }))} />;
}
