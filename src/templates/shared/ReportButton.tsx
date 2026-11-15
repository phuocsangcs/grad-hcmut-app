'use client';

import { useState } from 'react';
import { api } from '@/components/api';
import { REPORT_REASON_LABELS, REPORT_REASONS } from '@/modules/moderation/report.validators';
import { Button, Select, Input } from '@/ui';
import s from './report.module.css';

/** Nút nhỏ ở chân thiệp để báo cáo thiệp giả mạo / phản cảm. */
export function ReportButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');

  if (done) return <small className={s.done}>Đã gửi báo cáo. Cảm ơn bạn.</small>;
  if (!open)
    return (
      <button type="button" className={s.trigger} onClick={() => setOpen(true)}>
        Báo cáo thiệp này
      </button>
    );
  return (
    <form
      className={s.form}
      onSubmit={async (e) => {
        e.preventDefault();
        await api(`/api/cards/${slug}/report`, { method: 'POST', json: { reason, detail } }).catch(() => {});
        setDone(true);
      }}
    >
      <Select value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Lý do">
        {REPORT_REASONS.map((r) => (
          <option key={r} value={r}>
            {REPORT_REASON_LABELS[r]}
          </option>
        ))}
      </Select>
      <Input placeholder="Chi tiết (tuỳ chọn)" maxLength={500} value={detail} onChange={(e) => setDetail(e.target.value)} />
      <div className={s.btns}>
        <Button type="submit" size="sm" variant="secondary">
          Gửi báo cáo
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Huỷ
        </Button>
      </div>
    </form>
  );
}
