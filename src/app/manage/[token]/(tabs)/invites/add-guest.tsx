'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/components/api';
import { Button, Field, Icon, Input, Textarea } from '@/ui';
import { BulkForm } from './bulk-form';
import { LeadField, leadValue } from './lead-field';
import type { GuestDefaults } from './types';
import s from './invites.module.css';

const ERR: Record<string, string> = {
  too_many_invites: 'Đã đủ 200 khách cho thiệp này.',
  invalid_input: 'Kiểm tra lại tên, câu mời và lời nhắn.',
};

/** Cột trái: thêm từng khách, hoặc mở khung nhập hàng loạt. */
export function AddGuest({ token, defaults, full }: { token: string; defaults: GuestDefaults; full: boolean }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [lead, setLead] = useState('');
  const [message, setMessage] = useState('');
  const [bulk, setBulk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      await api(`/api/manage/${token}/invites`, {
        method: 'POST',
        json: { rows: [{ recipientName: name.trim(), greeting: leadValue(lead), message: message.trim() || null }] },
      });
      setMsg({ ok: true, text: `Đã thêm ${name.trim()}.` });
      setName('');
      setMessage('');
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: (err instanceof ApiError && ERR[err.code]) || 'Chưa thêm được, thử lại.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={s.panel} aria-labelledby="add-guest-title">
      <h2 id="add-guest-title" className={s.panelTitle}>
        Thêm khách mời
      </h2>

      {bulk ? (
        <>
          <BulkForm token={token} />
          <Button type="button" variant="ghost" size="sm" onClick={() => setBulk(false)} leading={<Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />}>
            Thêm từng người
          </Button>
        </>
      ) : (
        <form className={s.addForm} onSubmit={add}>
          <Field label="Tên khách">
            <Input required maxLength={60} value={name} placeholder="Bắt buộc, ví dụ: Cô Hoa" onChange={(e) => setName(e.target.value)} />
          </Field>
          <LeadField id="add-lead" value={lead} onChange={setLead} leads={defaults.leads} cardLead={defaults.lead} />
          <Field label="Lời nhắn riêng" optional hint={`${message.length}/500 · để trống sẽ dùng lời nhắn chung`}>
            <Textarea maxLength={500} rows={3} value={message} placeholder={defaults.message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
          <Button type="submit" block disabled={busy || full || !name.trim()} leading={<Icon name="plus" size={16} />}>
            {busy ? 'Đang thêm…' : 'Thêm khách'}
          </Button>
          {msg ? (
            <p className={msg.ok ? s.ok : s.err} role="status">
              {msg.text}
            </p>
          ) : null}
          <Button type="button" variant="secondary" block disabled={full} onClick={() => setBulk(true)} leading={<Icon name="upload" size={16} />}>
            Nhập hàng loạt
          </Button>
        </form>
      )}
    </section>
  );
}
