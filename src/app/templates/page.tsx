import { listTemplates } from '@/modules/content';
import { InvitationCard, SAMPLE_LINKS, sampleCard } from '@/templates';
import { Page, PageHeading } from '@/ui';
import { FitScreen } from './fit-screen';
import { sampleOptionsFor } from './samples';
import { TemplatePicker, type PickerItem } from './template-picker';

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
      <PageHeading title="Chọn mẫu thiệp" lead="Mẫu nào cũng tự đổi màu và hoạ tiết theo khoa của bạn. Chọn một mẫu để bắt đầu." />
      <TemplatePicker items={items} />
    </Page>
  );
}
