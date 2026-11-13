'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/components/api';

type Row = { recipientName: string; groupKey: string | null; greeting: string | null; templateId: string | null };
type Preview = { rows: Row[]; errors: { line: number; raw: string; message: string }[] };

/** Dán → preview → tạo. */
export function BulkForm({ token }: { token: string }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function doPreview() {
    setBusy(true); setMsg(null);
    try { setPreview(await api<Preview>(`/api/manage/${token}/invites/preview`, { method: 'POST', json: { text } })); }
    catch { setMsg('Không đọc được danh sách'); } finally { setBusy(false); }
  }
  async function doCreate() {
    if (!preview || preview.errors.length) return;
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ created: unknown[] }>(`/api/manage/${token}/invites`, { method: 'POST', json: { rows: preview.rows } });
      setMsg(`Đã tạo ${r.created.length} người nhận.`);
      setText(''); setPreview(null);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError && e.code === 'too_many_invites' ? 'Vượt giới hạn 200 người / thiệp' : 'Có lỗi, thử lại');
    } finally { setBusy(false); }
  }

  return (
    <section>
      <h2>Thêm hàng loạt</h2>
      <textarea rows={6} style={{ width: '100%' }} placeholder={'Ba Mẹ, parents\nCô Hoa\tfamily\tCô Hoa thương mến,\nMinh; friends; ; playful'} value={text} onChange={(e) => { setText(e.target.value); setPreview(null); }} />
      <p><button type="button" disabled={busy || !text.trim()} onClick={doPreview}>Xem trước</button></p>
      {preview && (
        <>
          {preview.errors.length > 0 && (
            <ul role="alert">{preview.errors.map((e, i) => <li key={i}>Dòng {e.line}: {e.message} <code>{e.raw}</code></li>)}</ul>
          )}
          <table>
            <thead><tr><th>#</th><th>Tên</th><th>Nhóm</th><th>Lời chào riêng</th><th>Mẫu</th></tr></thead>
            <tbody>{preview.rows.map((r, i) => <tr key={i}><td>{i + 1}</td><td>{r.recipientName}</td><td>{r.groupKey ?? '—'}</td><td>{r.greeting ?? '—'}</td><td>{r.templateId ?? 'mặc định'}</td></tr>)}</tbody>
          </table>
          <p><button type="button" disabled={busy || preview.errors.length > 0 || preview.rows.length === 0} onClick={doCreate}>Tạo {preview.rows.length} người nhận</button></p>
        </>
      )}
      {msg && <p>{msg}</p>}
    </section>
  );
}
