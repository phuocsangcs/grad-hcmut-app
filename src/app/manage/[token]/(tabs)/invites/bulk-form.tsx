'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/components/api';
import { Button, Icon, Textarea } from '@/ui';
import s from './invites.module.css';

type Row = { recipientName: string; greeting: string | null; message: string | null; templateId: string | null };
type Preview = { rows: Row[]; errors: { line: number; raw: string; message: string }[] };

/** Nhập hàng loạt: dán → kiểm tra → tạo. Mỗi dòng: Tên, Câu mời, Lời nhắn, Mẫu. */
export function BulkForm({ token }: { token: string }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function doPreview() {
    setBusy(true);
    setMsg(null);
    try {
      setPreview(await api<Preview>(`/api/manage/${token}/invites/preview`, { method: 'POST', json: { text } }));
    } catch {
      setMsg({ ok: false, text: 'Không đọc được danh sách.' });
    } finally {
      setBusy(false);
    }
  }
  async function doCreate() {
    if (!preview || preview.errors.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ created: unknown[] }>(`/api/manage/${token}/invites`, { method: 'POST', json: { rows: preview.rows } });
      setMsg({ ok: true, text: `Đã thêm ${r.created.length} khách.` });
      setText('');
      setPreview(null);
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError && e.code === 'too_many_invites' ? 'Vượt giới hạn 200 khách / thiệp.' : 'Có lỗi, thử lại.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.bulk}>
      <div className={s.help}>
        <p>
          Mỗi dòng một người: <code>Tên; Câu mời; Lời nhắn; Mẫu</code>. Chỉ cần Tên, các cột sau để trống thì dùng của thiệp.
        </p>
        <p>Dán thẳng từ Excel (Tab) cũng được. Lời nhắn có dấu phẩy thì phân cách bằng chấm phẩy hoặc Tab.</p>
      </div>
      <Textarea
        className={s.mono}
        rows={7}
        aria-label="Danh sách khách"
        placeholder={'Ba Mẹ\nCô Hoa; Kính mời\nÔng Bà; Kính mời; Cháu đón Ông Bà ở cổng nhé\nMinh; Thân mời; ; ticket'}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setPreview(null);
        }}
      />
      {!preview ? (
        <Button type="button" variant="secondary" block disabled={busy || !text.trim()} onClick={doPreview} leading={<Icon name="eye" size={16} />}>
          Kiểm tra danh sách
        </Button>
      ) : (
        <>
          {preview.errors.length > 0 && (
            <ul role="alert" className={s.errors}>
              {preview.errors.map((e, i) => (
                <li key={i}>
                  Dòng {e.line}: {e.message} <code>{e.raw}</code>
                </li>
              ))}
            </ul>
          )}
          <ul className={s.previewList}>
            {preview.rows.map((r, i) => (
              <li key={i}>
                <span>
                  {r.greeting ? <small>{r.greeting}: </small> : null}
                  <strong>{r.recipientName}</strong>
                </span>
                <small>
                  {r.message ? `“${r.message}” · ` : ''}
                  {r.templateId ?? 'mẫu của thiệp'}
                </small>
              </li>
            ))}
          </ul>
          <Button type="button" block disabled={busy || preview.errors.length > 0 || preview.rows.length === 0} onClick={doCreate} leading={<Icon name="check" size={16} />}>
            Thêm {preview.rows.length} khách
          </Button>
        </>
      )}
      {msg && (
        <p className={msg.ok ? s.ok : s.err} aria-live="polite">
          {msg.text}
        </p>
      )}
    </div>
  );
}
