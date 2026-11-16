import { notFound } from 'next/navigation';
import { SAMPLE_PHOTOS } from '../templates/samples';
import { InvitationCard, SAMPLE_LINKS, sampleCard } from '@/templates';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<Record<string, string | undefined>> };

/**
 * Sân chơi UI (chỉ ngoài production): xem mọi template với dữ liệu mẫu, không cần DB.
 *   /playground?template=glass&faculty=che&mode=dayof&lead=Kính%20mời&name=Cô%20Hoa&music=carefree
 */
export default async function PlaygroundPage({ searchParams }: Props) {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_PLAYGROUND !== '1') notFound();
  const sp = await searchParams;
  const card = sampleCard({ templateId: sp.template, facultyId: sp.faculty, inviteLead: sp.lead, inviteeName: sp.name, message: sp.message, mode: sp.mode, photos: SAMPLE_PHOTOS[sp.template ?? ''], musicId: sp.music ?? (sp.template === 'dossier' ? 'carefree' : undefined) });
  return <InvitationCard card={card} links={SAMPLE_LINKS} preview />;
}
