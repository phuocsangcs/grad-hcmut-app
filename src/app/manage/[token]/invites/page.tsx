import Link from 'next/link';
import { requireCardByToken } from '@/modules/manage';
import { listInvites } from '@/modules/invite';
import { listTemplates } from '@/modules/content';
import { HttpError } from '@/lib/http';
import { Button, Icon, Page, PageHeading, Surface } from '@/ui';
import { BulkForm } from './bulk-form';
import { InviteRowActions } from './invite-row-actions';
import s from './invites.module.css';

type Props = { params: Promise<{ token: string }> };

export const metadata = { title: 'Người nhận', robots: { index: false } };
const MAX = 200;

/** Danh sách người nhận (link riêng từng người) + thêm hàng loạt. */
export default async function InvitesPage({ params }: Props) {
  const { token } = await params;
  let card;
  try {
    card = await requireCardByToken(token);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return (
        <Page width="narrow">
          <PageHeading title="Link quản lý không đúng" lead="Kiểm tra lại link, hoặc tạo thiệp mới." />
          <div><Button href="/templates">Tạo thiệp</Button></div>
        </Page>
      );
    }
    throw e;
  }
  const list = await listInvites(card.slug, card.id);
  const templates = listTemplates();
  const confirmed = list.filter((i) => i.rsvp).length;

  return (
    <Page>
      <div>
        <Link href={`/manage/${token}`} className={s.back}><Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} /> Trang quản lý</Link>
        <PageHeading
          title="Gửi riêng từng người"
          lead={`Mỗi người một link, mở ra thấy đúng tên mình và câu mời riêng. Đã mời ${list.length}/${MAX} người, ${confirmed} đã xác nhận.`}
        />
      </div>

      <div className={s.layout}>
        <section>
          <h2 className={s.h2}>
            Danh sách
            {list.length > 0 && (
              <Button href={`/api/manage/${token}/invites/export`} variant="ghost" size="sm" leading={<Icon name="download" size={16} />}>Tải CSV</Button>
            )}
          </h2>
          {list.length === 0 ? (
            <div className={s.empty}>
              <p><strong>Chưa có người nhận.</strong></p>
              <p>Dán danh sách ở khung bên cạnh, mỗi dòng một người.</p>
            </div>
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr><th>Người nhận</th><th>Câu mời</th><th className={s.num}>Đã mở</th><th>Xác nhận</th><th><span className="sr-only">Thao tác</span></th></tr>
                </thead>
                <tbody>
                  {list.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <div className={s.name}>{i.recipientName}</div>
                        <div className={s.code}>/{card.slug}/{i.code}</div>
                      </td>
                      <td>{i.greeting ?? <span className={s.no}>Như thiệp</span>}</td>
                      <td className={s.num}>{i.viewCount}</td>
                      <td>{i.rsvp ? <span className={s.yes}>✓ {i.rsvp.headcount} người</span> : <span className={s.no}>Chưa</span>}</td>
                      <td><InviteRowActions token={token} id={i.id} url={i.url} name={i.recipientName} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside style={{ display: 'grid', gap: 16 }}>
          <Surface>
            <h2 className={s.h2}>Thêm hàng loạt</h2>
            <BulkForm token={token} />
          </Surface>
          <Surface tone="tint" pad="sm">
            <div className={s.help}>
              <p>Mỗi dòng: <code>Tên, Câu mời, Mẫu</code>. Chỉ cần Tên, còn lại tuỳ chọn. Dán thẳng từ Excel (Tab) cũng được.</p>
              <p>Câu mời ví dụ: <code>Kính mời</code> <code>Thân mời</code>. Bỏ trống thì dùng câu mời của thiệp.</p>
              <p>Mẫu: {templates.map((t) => <code key={t.id}>{t.id}</code>).reduce<React.ReactNode[]>((a, c, i) => (i ? [...a, ' ', c] : [c]), [])}</p>
            </div>
          </Surface>
        </aside>
      </div>
    </Page>
  );
}
