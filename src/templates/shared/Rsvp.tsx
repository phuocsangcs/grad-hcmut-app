'use client';

import { useEffect, useState } from 'react';
import { api, getClientId } from '@/components/api';
import { vi } from '@/lib/i18n';
import { Button, Field, Icon, Input, Textarea } from '@/ui';
import s from './blocks.module.css';

type Props = {
  slug: string;
  groupKey: string | null;
  recipientName: string | null;
  inviteCode?: string;
  /** Nhãn nút theo nhóm khách: "Ba Mẹ sẽ đến", "Ông Bà sẽ đến", "Mình sẽ đến". */
  cta: string;
  preview?: boolean;
};

type Mine = { confirmed: boolean; guestName?: string; headcount?: number; wish?: string | null };

/**
 * RSVP: một nút lớn, bấm mới mở form (tên, số người, lời chúc).
 * Nhớ trên máy: lần sau mở lại hiện "Đã báo ✓" thay vì hỏi lại.
 */
export function Rsvp(p: Props) {
  const [mine, setMine] = useState<Mine | null>(p.preview ? { confirmed: false } : null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(p.recipientName ?? '');
  const [headcount, setHeadcount] = useState(2);
  const [wish, setWish] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (p.preview) return;
    api<Mine>(`/api/cards/${p.slug}/rsvp?clientId=${getClientId()}`)
      .then(setMine)
      .catch(() => setMine({ confirmed: false }));
  }, [p.slug, p.preview]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (p.preview) {
      setMine({ confirmed: true, guestName: name || 'Khách', headcount, wish });
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await api(`/api/cards/${p.slug}/rsvp`, {
        method: 'POST',
        json: { clientId: getClientId(), guestName: name, headcount, wish: wish || null, groupKey: p.groupKey, inviteCode: p.inviteCode ?? null },
      });
      setMine({ confirmed: true, guestName: name, headcount, wish });
    } catch {
      setErr(vi.errors.server);
    } finally {
      setBusy(false);
    }
  }

  if (mine === null) return <div className={s.rsvpSkeleton} aria-hidden="true" />;

  if (mine.confirmed) {
    return (
      <div className={s.rsvpDone} role="status">
        <span className={s.rsvpCheck}>
          <Icon name="check" size={18} />
        </span>
        <div>
          <b>Đã báo rồi · {mine.guestName}</b>
          <small>
            {mine.headcount} người{mine.wish ? ` · “${mine.wish}”` : ''}
          </small>
        </div>
        <button type="button" className={s.textBtn} onClick={() => { setOpen(true); setMine({ confirmed: false }); }}>
          Sửa
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <Button size="lg" block onClick={() => setOpen(true)} trailing={<Icon name="arrow" size={18} />} className={s.rsvpCta}>
        {p.cta}
      </Button>
    );
  }

  return (
    <form className={s.rsvpForm} onSubmit={submit}>
      <Field label="Tên để báo cho tân cử nhân" hint="Chỉ cần tên gọi, ví dụ “Cô Hai”, không cần họ tên đầy đủ.">
        <Input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ba Mẹ" autoFocus />
      </Field>
      <Field label="Đi mấy người">
        <div className={s.stepper}>
          <button type="button" aria-label="Bớt một người" onClick={() => setHeadcount((n) => Math.max(1, n - 1))}>
            −
          </button>
          <output>{headcount}</output>
          <button type="button" aria-label="Thêm một người" onClick={() => setHeadcount((n) => Math.min(20, n + 1))}>
            +
          </button>
        </div>
      </Field>
      <Field label="Lời chúc" optional>
        <Textarea maxLength={300} rows={2} value={wish} onChange={(e) => setWish(e.target.value)} placeholder="Chúc con…" />
      </Field>
      {err ? (
        <p className={s.formError} role="alert">
          {err}
        </p>
      ) : null}
      <div className={s.rsvpBtns}>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? 'Đang gửi…' : 'Gửi xác nhận'}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Để sau
        </Button>
      </div>
    </form>
  );
}
