import Link from 'next/link';
import { requireCardByToken } from '@/modules/manage';
import { listInvites } from '@/modules/invite';
import { listGreetingGroups, listTemplates } from '@/modules/content';
import { HttpError } from '@/lib/http';
import { BulkForm } from './bulk-form';
import { InviteRowActions } from './invite-row-actions';

type Props = { params: Promise<{ token: string }> };

/** UI trần: danh sách người nhận + form dán hàng loạt (gọi API bằng fetch ở Phase 6). */
export default async function InvitesPage({ params }: Props) {
  const { token } = await params;
  let card;
  try {
    card = await requireCardByToken(token);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return <main><p>Link quản lý không đúng.</p></main>;
    throw e;
  }
  const list = await listInvites(card.slug, card.id);
  const groups = listGreetingGroups();
  const templates = listTemplates();

  return (
    <main>
      <p><Link href={`/manage/${token}`}>← Quản lý</Link></p>
      <h1>Người nhận ({list.length}/200)</h1>
      <p>
        Dán danh sách từ Excel hoặc Zalo, mỗi dòng một người. Cột cách nhau bằng Tab hoặc dấu phẩy:
        <code> Tên, Nhóm, Lời chào riêng, Mẫu</code>. Nhóm: {groups.map((g) => `${g.label} (${g.key})`).join(', ')}.
        Mẫu: {templates.map((t) => t.id).join(', ')}. Lời chào có dấu phẩy thì dùng Tab hoặc chấm phẩy để phân cách.
      </p>
      <p>
        <a href={`/api/manage/${token}/invites/export`}>Tải CSV</a>
      </p>
      <BulkForm token={token} />
      {list.length === 0 ? (
        <p>Chưa có người nhận.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Tên</th><th>Nhóm</th><th>Link</th><th>Mở</th><th>RSVP</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id}>
                <td>{i.recipientName}</td>
                <td>{i.groupKey ?? '—'}</td>
                <td><a href={i.url}>{i.url}</a></td>
                <td>{i.viewCount}</td>
                <td>{i.rsvp ? `${i.rsvp.headcount} người` : '—'}</td>
                <td><InviteRowActions token={token} id={i.id} url={i.url} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
