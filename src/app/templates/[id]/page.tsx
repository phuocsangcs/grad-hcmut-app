import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFaculty, getTemplate, listMusic, listRealFaculties } from '@/modules/content';
import { InvitationCard, SAMPLE_LINKS, sampleCard } from '@/templates';
import { sampleOptionsFor } from '../samples';
import { DemoBar } from './demo-bar';

// Đọc ?faculty= và tính đếm ngược theo giờ hiện tại → render mỗi lần xem.
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ faculty?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = getTemplate(id);
  return { title: t ? `Xem demo mẫu ${t.name}` : 'Không có mẫu này', robots: { index: false } };
}

/**
 * Demo công khai của một mẫu: thiệp đầy đủ với dữ liệu mẫu (ảnh AI, nhạc, lời mời),
 * bấm thử được mọi thứ nhưng không gọi API (preview). Đổi khoa để thấy màu/hoạ tiết đổi theo.
 */
export default async function TemplateDemoPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { faculty } = await searchParams;
  const template = getTemplate(id);
  if (!template) notFound();

  const base = sampleOptionsFor(id);
  const facultyId = faculty && getFaculty(faculty)?.kind === 'faculty' ? faculty : base.facultyId;
  const card = sampleCard({ ...base, facultyId, musicId: listMusic()[0]?.id });

  return (
    <>
      <DemoBar
        templateId={id}
        templateName={template.name}
        facultyId={facultyId}
        faculties={listRealFaculties().map((f) => ({ id: f.id, name: f.name }))}
      />
      <InvitationCard card={card} links={SAMPLE_LINKS} preview />
    </>
  );
}
