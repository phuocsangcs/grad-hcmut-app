import Link from 'next/link';
import { CONTACT_TOPICS, type ContactTopic } from '@/modules/legal/contact.validators';
import { Page, PageHeading, Prose } from '@/ui';
import { ContactForm } from './contact-form';

export const metadata = { title: 'Liên hệ', description: 'Gửi góp ý, báo lỗi hoặc yêu cầu gỡ nội dung cho dự án Ngày Ra Trường.' };

type Props = { searchParams: Promise<{ topic?: string; slug?: string }> };

/** Liên hệ qua form: tin nhắn lưu vào hệ thống, không cần công khai email của chủ dự án. */
export default async function ContactPage({ searchParams }: Props) {
  const { topic, slug } = await searchParams;
  const initialTopic = topic && topic in CONTACT_TOPICS ? (topic as ContactTopic) : undefined;
  return (
    <Page width="narrow">
      <PageHeading title="Liên hệ" lead="Góp ý, báo lỗi, hay cần gỡ một nội dung liên quan đến bạn? Nhắn ở đây, mình đọc hết." />
      <ContactForm initialTopic={initialTopic} initialSlug={slug?.slice(0, 80)} />
      <Prose>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
          Tin nhắn chỉ chủ dự án đọc được và tự xoá sau 180 ngày. Muốn báo một thiệp cụ thể, bạn cũng có thể bấm “Báo nội dung” ở cuối thiệp đó. Xem thêm{' '}
          <Link href="/privacy">Quyền riêng tư</Link>.
        </p>
      </Prose>
    </Page>
  );
}
