'use client';

import { useState } from 'react';
import { api } from '@/components/api';
import { REPORT_REASON_LABELS, REPORT_REASONS } from '@/modules/moderation/report.validators';

export function ReportButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');
  if (done) return <small>Đã gửi báo cáo. Cảm ơn bạn.</small>;
  if (!open) return <button type="button" onClick={() => setOpen(true)}><small>Báo cáo thiệp này</small></button>;
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await api(`/api/cards/${slug}/report`, { method: 'POST', json: { reason, detail } }).catch(() => {}); setDone(true); }}>
      <select value={reason} onChange={(e) => setReason(e.target.value)}>
        {REPORT_REASONS.map((r) => <option key={r} value={r}>{REPORT_REASON_LABELS[r]}</option>)}
      </select>
      <input placeholder="Chi tiết (tuỳ chọn)" maxLength={500} value={detail} onChange={(e) => setDetail(e.target.value)} />
      <button type="submit">Gửi</button>
    </form>
  );
}
