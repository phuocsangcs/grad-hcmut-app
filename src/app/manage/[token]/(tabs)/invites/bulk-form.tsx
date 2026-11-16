'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/components/api';
import { Button, Icon, Textarea } from '@/ui';
import s from './invites.module.css';

type Row = { recipientName: string; greeting: string | null; templateId: string | null };
type Preview = { rows: Row[]; errors: { line: number; raw: string; message: string }[] };

/** Dán → kiểm tra → tạo. */
export function BulkForm({ token }: { token: string }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function doPreview() {
    setBusy(true); setMsg(null);
    try { setPreview(await api<Preview>(`/api/manage/${token}/invites/preview`, { method: 'POST', json: { text } })); }
    catch { setMsg({ ok: false, text: 'Không đọc được danh sách.' }); } finally { setBusy(false); }
  }
  async function doCreate() {
    if (!preview || preview.errors.length) return;
    setBusy(true); setMsg(null);
    try {
      const r = await api<{ created: unknown[] }>(`/api/manage/${token}/invites`, { method: 'POST', json: { rows: preview.rows } });
      setMsg({ ok: true, text: `Đã tạo ${r.created.length} người nhận.` });
      setText(''); setPreview(null);
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ApiError && e.code === 'too_many_invites' ? 'Vượt giới hạn 200 người / thiệp.' : 'Có lỗi, thử lại.' });
    } finally { setBusy(false); }
  }

  return (
    <div className={s.bulk}>
      <Textarea
        className={s.mono}
        rows={6}
        aria-label="Danh sách người nhận"
        placeholder={'Ba Mẹ\nCô Hoa, Kính mời\nMinh; Thân mời; ticket'}
        value={text}
        onChange={(e) => { setText(e.target.value); setPreview(null); }}
      />
      {!preview ? (
        <Button type="button" variant="secondary" disabled={busy || !text.trim()} onClick={doPreview} leading={<Icon name="eye" size={16} />}>Kiểm tra danh sách</Button>
      ) : (
        <>
          {preview.errors.length > 0 && (
            <ul role="alert" className={s.errors}>
              {preview.errors.map((e, i) => <li key={i}>Dòng {e.line}: {e.message} <code>{e.raw}</code></li>)}
            </ul>
          )}
          <ul className={s.previewList}>
            {preview.rows.map((r, i) => (
              <li key={i}>
                <span>{r.greeting ? <small>{r.greeting}: </small> : null}<strong>{r.recipientName}</strong></span>
                <small>{r.templateId ?? 'mẫu của thiệp'}</small>
              </li>
            ))}
          </ul>
          <Button type="button" disabled={busy || preview.errors.length > 0 || preview.rows.length === 0} onClick={doCreate} leading={<Icon name="check" size={16} />}>
            Tạo {preview.rows.length} người nhận
          </Button>
        </>
      )}
      {msg && <p className={s.msg} style={msg.ok ? undefined : { color: '#b42318' }} aria-live="polite">{msg.text}</p>}
    </div>
  );
}
