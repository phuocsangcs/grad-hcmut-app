'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/components/api';

type Props = { token: string; templates: { id: string; name: string }[]; current: { templateId: string; message: string; displayName: string } };

/** Sửa nhanh: đổi mẫu, lời nhắn, tên. Xoá thiệp. */
export function CardActions({ token, templates, current }: Props) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(current.templateId);
  const [message, setMessage] = useState(current.message);
  const [displayName, setDisplayName] = useState(current.displayName);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try { await api(`/api/manage/${token}`, { method: 'PATCH', json: { templateId, message, displayName } }); router.refresh(); }
    finally { setBusy(false); }
  }
  async function del() {
    if (!confirm('Xoá thiệp và toàn bộ RSVP? Không khôi phục được.')) return;
    await api(`/api/manage/${token}`, { method: 'DELETE' });
    router.push('/');
  }
  return (
    <section>
      <h2>Sửa thiệp</h2>
      <label>Tên <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></label>
      <label>Mẫu <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <label>Lời nhắn<br /><textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} /></label>
      <p><button type="button" disabled={busy} onClick={save}>Lưu</button> <button type="button" onClick={del} style={{ color: 'red' }}>Xoá thiệp</button></p>
    </section>
  );
}
