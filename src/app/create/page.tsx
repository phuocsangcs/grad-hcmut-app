import { defaultTemplateId, getTemplate, listMusic, greetingsFile, listFaculties, listGreetingGroups, listMeetingPois, listTemplates } from '@/modules/content';
import { isStorageEnabled } from '@/lib/storage';
import { Page, PageHeading } from '@/ui';
import { CreateForm } from './create-form';

export const metadata = { title: 'Tạo thiệp tốt nghiệp' };

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { template } = await searchParams;
  const initialTemplateId = template && getTemplate(template) ? template : undefined;
  return (
    <Page>
      <PageHeading title="Tạo thiệp mời" lead="Điền thông tin, thiệp tự cập nhật ngày giờ theo khoa và đổi giao diện trong ngày lễ." />
      <CreateForm
        faculties={listFaculties()}
        templates={listTemplates()}
        pois={listMeetingPois()}
        groups={listGreetingGroups()}
        suggestions={greetingsFile.messageSuggestions}
        defaultTemplateId={defaultTemplateId}
        initialTemplateId={initialTemplateId}
        photosEnabled={isStorageEnabled()}
        music={listMusic().map((m) => ({ id: m.id, title: m.artist ? `${m.title} · ${m.artist}` : m.title }))}
      />
    </Page>
  );
}
