'use client';

import { useState } from 'react';
import { api } from '@/components/api';
import { Button, Field, Input } from '@/ui';

/** Lấy lại link quản lý qua email (API luôn trả thành công để không lộ email). */
export function RecoverForm() {
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    try {
      await api('/api/recover', { method: 'POST', json: { email, slug: slug || undefined } });
      setState('done');
    } catch { setState('error'); }
  }

  if (state === 'done') return <p style={{ fontWeight: 600, color: 'var(--leaf-ink)' }}>Nếu email này có thiệp, link quản lý mới đã được gửi. Kiểm tra cả hộp thư rác nhé.</p>;
  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 460 }}>
      <Field label="Email đã nhập khi tạo thiệp">
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Đường dẫn thiệp" optional hint="Ví dụ: minh-anh. Bỏ trống nếu không nhớ.">
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field>
      {state === 'error' && <p role="alert" style={{ color: '#b42318', fontWeight: 600 }}>Gửi chưa được, thử lại sau ít phút.</p>}
      <div><Button type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Đang gửi…' : 'Gửi lại link'}</Button></div>
    </form>
  );
}
