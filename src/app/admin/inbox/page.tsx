import { cookies } from 'next/headers';
import { ADMIN_COOKIE, CONTACT_TOPICS, isAdminConfigured, isAdminSession, listContactMessages } from '@/modules/legal';
import { Button, Field, Input, Page, PageHeading } from '@/ui';
import { login, logout, removeMessage, toggleRead } from './actions';
import s from './inbox.module.css';

export const metadata = { title: 'Hộp thư liên hệ', robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ e?: string }> };

const fmt = (d: Date) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' }).format(d);

/**
 * Hộp thư của chủ dự án: đọc tin nhắn gửi từ /contact.
 * Đăng nhập bằng mật khẩu ADMIN_TOKEN (biến môi trường), không cần tài khoản.
 */
export default async function InboxPage({ searchParams }: Props) {
  const { e } = await searchParams;

  if (!isAdminConfigured()) {
    return (
      <Page width="narrow">
        <PageHeading title="Hộp thư liên hệ" lead="Chưa bật. Đặt biến môi trường ADMIN_TOKEN (tối thiểu 16 ký tự) rồi deploy lại để dùng trang này." />
      </Page>
    );
  }

  const jar = await cookies();
  if (!isAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    return (
      <Page width="narrow">
        <PageHeading title="Hộp thư liên hệ" lead="Nhập mật khẩu quản trị (giá trị ADMIN_TOKEN) để xem tin nhắn." />
        <form action={login} className={s.login}>
          <Field label="Mật khẩu" error={e === 'wrong' ? 'Sai mật khẩu.' : e === 'limit' ? 'Thử sai quá nhiều lần, đợi 15 phút.' : undefined}>
            <Input type="password" name="password" required autoComplete="current-password" autoFocus />
          </Field>
          <div>
            <Button type="submit">Vào hộp thư</Button>
          </div>
        </form>
      </Page>
    );
  }

  const messages = await listContactMessages();
  const unread = messages.filter((m) => !m.readAt).length;

  return (
    <Page width="narrow">
      <div className={s.head}>
        <PageHeading title="Hộp thư liên hệ" lead={messages.length ? `${messages.length} tin nhắn · ${unread} chưa đọc. Tin tự xoá sau 180 ngày.` : 'Chưa có tin nhắn nào.'} />
        <form action={logout}>
          <Button type="submit" variant="secondary" size="sm">Đăng xuất</Button>
        </form>
      </div>

      <ul className={s.list}>
        {messages.map((m) => (
          <li key={m.id} className={s.item} data-unread={m.readAt ? undefined : ''}>
            <div className={s.meta}>
              <span className={s.topic}>{CONTACT_TOPICS[m.topic as keyof typeof CONTACT_TOPICS] ?? m.topic}</span>
              <time dateTime={m.createdAt.toISOString()}>{fmt(m.createdAt)}</time>
            </div>
            <p className={s.from}>
              <b>{m.name || 'Ẩn danh'}</b>
              {m.replyTo ? <> · liên lạc lại: <span className={s.reply}>{m.replyTo}</span></> : <span className={s.muted}> · không để lại cách liên lạc</span>}
              {m.cardSlug ? <> · thiệp: <a href={`/${m.cardSlug}`} target="_blank" rel="noreferrer">/{m.cardSlug}</a></> : null}
            </p>
            <p className={s.body}>{m.message}</p>
            <div className={s.actions}>
              <form action={toggleRead}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="read" value={m.readAt ? '0' : '1'} />
                <button type="submit">{m.readAt ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}</button>
              </form>
              <form action={removeMessage}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className={s.danger}>Xoá</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </Page>
  );
}
