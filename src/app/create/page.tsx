import { defaultTemplateId, greetingsFile, listFaculties, listGreetingGroups, listMeetingPois, listTemplates } from '@/modules/content';
import { CreateForm } from './create-form';

export const metadata = { title: 'Tạo thiệp tốt nghiệp' };

export default function CreatePage() {
  return (
    <main>
      <h1>Tạo thiệp</h1>
      <CreateForm
        faculties={listFaculties()}
        templates={listTemplates()}
        pois={listMeetingPois()}
        groups={listGreetingGroups()}
        suggestions={greetingsFile.messageSuggestions}
        defaultTemplateId={defaultTemplateId}
      />
    </main>
  );
}
