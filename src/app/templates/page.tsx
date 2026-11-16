import { listTemplates } from '@/modules/content';
import { InvitationCard, SAMPLE_LINKS, sampleCard } from '@/templates';
import { Page } from '@/ui';
import { FitScreen } from './fit-screen';
import { sampleOptionsFor } from './samples';
import { TemplatePicker, type PickerItem } from './template-picker';
import s from './templates.module.css';

export const metadata = { title: 'Chọn mẫu thiệp' };

export default function TemplatesPage() {
  const items: PickerItem[] = listTemplates().map((t) => {
    const card = sampleCard(sampleOptionsFor(t.id));
    const inner = <InvitationCard card={card} links={SAMPLE_LINKS} preview />;
    return {
      id: t.id,
      cover: t.cover,
      name: t.name,
      description: t.description,
      thumb: <FitScreen>{inner}</FitScreen>,
      large: <FitScreen>{inner}</FitScreen>,
    };
  });

  return (
    <Page>
      <header className={s.head}>
        <h1 className={s.headTitle}>Chọn mẫu thiệp</h1>
        <p className={s.headLead}>Mẫu nào cũng tự đổi màu và hoạ tiết theo khoa của bạn. Chọn một mẫu để bắt đầu.</p>
      </header>
      <TemplatePicker items={items} />
    </Page>
  );
}
