import { defaultTemplateId, getTemplate, listMusic, greetingsFile, listRealFaculties, listInviteLeads, listMeetingPois, listTemplates } from '@/modules/content';
import { isStorageEnabled } from '@/lib/storage';
import { Page } from '@/ui';
import { CreateForm } from './create-form';
import s from './create.module.css';

export const metadata = { title: 'Tạo thiệp tốt nghiệp' };

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { template } = await searchParams;
  const initialTemplateId = template && getTemplate(template) ? template : undefined;
  return (
    <Page noFooter headerClassName={s.siteHeader}>
      <CreateForm
        faculties={listRealFaculties()}
        templates={listTemplates()}
        pois={listMeetingPois()}
        inviteLeads={listInviteLeads()}
        defaultInviteLead={greetingsFile.defaultInviteLead}
        defaultInvitee={greetingsFile.defaultInvitee}
        suggestions={greetingsFile.messageSuggestions}
        defaultTemplateId={defaultTemplateId}
        initialTemplateId={initialTemplateId}
        photosEnabled={isStorageEnabled()}
        music={listMusic().map((m) => ({ id: m.id, title: m.title, artist: m.artist, src: m.src }))}
      />
    </Page>
  );
}
