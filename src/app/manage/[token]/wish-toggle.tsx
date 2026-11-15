'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/components/api';

/** Chủ thiệp ẩn/hiện một lời chúc trong lưu bút công khai. */
export function WishToggle({ token, id, hidden }: { token: string; id: string; hidden: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await api(`/api/manage/${token}/rsvps/${id}`, { method: 'PATCH', json: { hidden: !hidden } });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      style={{ background: 'none', border: 0, padding: 0, color: 'var(--bk-600)', fontSize: 'var(--text-xs)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
    >
      {hidden ? 'Đang ẩn khỏi lưu bút · Hiện lại' : 'Ẩn khỏi lưu bút'}
    </button>
  );
}
