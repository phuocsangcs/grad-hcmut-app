import { defaultTemplateId, greetingsFile, listFaculties, listGreetingGroups, listMeetingPois, listTemplates } from '@/modules/content';
import { Page, PageHeading } from '@/ui';
import { CreateForm } from './create-form';

export const metadata = { title: 'Tạo thiệp tốt nghiệp' };

export default function CreatePage() {
  return (
    <Page>
      <PageHeading eyebrow="Miễn phí · không cần tài khoản" title="Tạo thiệp mời" lead="Ba bước, chưa tới hai phút. Thiệp tự cập nhật ngày giờ theo khoa và đổi giao diện trong ngày lễ." />
      <CreateForm
        faculties={listFaculties()}
        templates={listTemplates()}
        pois={listMeetingPois()}
        groups={listGreetingGroups()}
        suggestions={greetingsFile.messageSuggestions}
        defaultTemplateId={defaultTemplateId}
      />
    </Page>
  );
}
