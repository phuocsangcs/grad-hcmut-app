'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/components/api';

export function InviteRowActions({ token, id, url }: { token: string; id: string; url: string }) {
  const router = useRouter();
  return (
    <>
      <button type="button" onClick={() => navigator.clipboard?.writeText(url)}>Copy</button>{' '}
      <button type="button" onClick={async () => { if (confirm('Xoá người nhận này? Link riêng sẽ hết hiệu lực.')) { await api(`/api/manage/${token}/invites/${id}`, { method: 'DELETE' }); router.refresh(); } }}>Xoá</button>
    </>
  );
}
