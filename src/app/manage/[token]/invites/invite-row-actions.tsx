'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/components/api';
import { Button, CopyButton, Icon } from '@/ui';
import s from './invites.module.css';

export function InviteRowActions({ token, id, url, name }: { token: string; id: string; url: string; name: string }) {
  const router = useRouter();
  async function remove() {
    if (!confirm(`Xoá ${name}? Link riêng sẽ hết hiệu lực.`)) return;
    await api(`/api/manage/${token}/invites/${id}`, { method: 'DELETE' });
    router.refresh();
  }
  return (
    <div className={s.rowActions}>
      <CopyButton text={url} size="sm" label="Chép link" doneLabel="Đã chép" />
      <Button type="button" variant="ghost" size="sm" onClick={remove} aria-label={`Xoá ${name}`} leading={<Icon name="trash" size={16} />}>
        <span className="sr-only">Xoá</span>
      </Button>
    </div>
  );
}
