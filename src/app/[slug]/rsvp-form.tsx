'use client';

import { useEffect, useState } from 'react';
import { api, getClientId } from '@/components/api';
import { vi } from '@/lib/i18n';

type Props = { slug: string; groupKey: string | null; recipientName: string | null; inviteCode?: string; icsUrl: string; googleCalendarUrl: string };

type Mine = { confirmed: boolean; guestName?: string; headcount?: number; wish?: string | null };

/** RSVP: nhớ trên máy, lần sau mở lại hiện "Đã xác nhận ✓". */
export function RsvpForm(p: Props) {
  const [mine, setMine] = useState<Mine | null>(null);
  const [name, setName] = useState(p.recipientName ?? '');
  const [headcount, setHeadcount] = useState(1);
  const [wish, setWish] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Mine>(`/api/cards/${p.slug}/rsvp?clientId=${getClientId()}`).then(setMine).catch(() => setMine({ confirmed: false }));
  }, [p.slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await api(`/api/cards/${p.slug}/rsvp`, {
        method: 'POST',
        json: { clientId: getClientId(), guestName: name, headcount, wish: wish || null, groupKey: p.groupKey, inviteCode: p.inviteCode ?? null },
      });
      setMine({ confirmed: true, guestName: name, headcount, wish });
    } catch { setErr(vi.errors.server); } finally { setBusy(false); }
  }

  if (mine === null) return <p>…</p>;
  if (mine.confirmed) {
    return (
      <section>
        <p><strong>{vi.rsvp.confirmed}</strong> {mine.guestName} · {mine.headcount} người</p>
        <p>{vi.rsvp.thanks}</p>
        <p><a href={p.googleCalendarUrl} target="_blank" rel="noreferrer">Thêm vào Google Calendar</a> · <a href={p.icsUrl}>Tải .ics</a></p>
        <button onClick={() => setMine({ confirmed: false })}>Sửa</button>
      </section>
    );
  }
  return (
    <form onSubmit={submit}>
      <h3>{vi.rsvp.willCome}</h3>
      <label>Tên <input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>{vi.rsvp.headcount} <input type="number" min={1} max={20} value={headcount} onChange={(e) => setHeadcount(Number(e.target.value))} /></label>
      <label>{vi.rsvp.wish}<br /><textarea maxLength={300} rows={2} value={wish} onChange={(e) => setWish(e.target.value)} /></label>
      {err && <p role="alert">{err}</p>}
      <button type="submit" disabled={busy}>{vi.rsvp.willCome}</button>
    </form>
  );
}
