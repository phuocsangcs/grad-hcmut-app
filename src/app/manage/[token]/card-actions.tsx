'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/components/api';
import { Button, Field, Icon, Input, Select, Surface, Textarea } from '@/ui';
import s from './manage.module.css';

type Current = { templateId: string; message: string; displayName: string; meetingPoiId: string; meetingTime: string; phone: string };
type Props = {
  token: string;
  templates: { id: string; name: string; description: string }[];
  pois: { id: string; name: string }[];
  current: Current;
};

/** Sửa nhanh thiệp (PATCH /api/manage/:token) và vùng xoá thiệp. */
export function CardActions({ token, templates, pois, current }: Props) {
  const router = useRouter();
  const [v, setV] = useState<Current>(current);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const set = <K extends keyof Current>(k: K, val: Current[K]) => { setV((c) => ({ ...c, [k]: val })); setStatus('idle'); };
  const dirty = (Object.keys(current) as (keyof Current)[]).some((k) => current[k] !== v[k]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/api/manage/${token}`, {
        method: 'PATCH',
        json: {
          templateId: v.templateId, message: v.message, displayName: v.displayName,
          meetingPoiId: v.meetingPoiId || null, meetingTime: v.meetingTime || null, phone: v.phone || null,
        },
      });
      setStatus('saved');
      router.refresh();
    } catch {
      setStatus('error');
    } finally { setBusy(false); }
  }
  async function del() {
    if (!confirm('Xoá thiệp và toàn bộ RSVP? Không khôi phục được.')) return;
    await api(`/api/manage/${token}`, { method: 'DELETE' });
    router.push('/');
  }

  return (
    <>
      <Surface as="section">
        <h2 className={s.h2}>Sửa thiệp <small>Thay đổi hiện ngay với mọi người đã có link</small></h2>
        <form className={s.form} onSubmit={save}>
          <div className={s.row}>
            <Field label="Tên hiển thị">
              <Input required maxLength={60} value={v.displayName} onChange={(e) => set('displayName', e.target.value)} />
            </Field>
            <Field label="Mẫu thiệp" hint={templates.find((t) => t.id === v.templateId)?.description}>
              <Select value={v.templateId} onChange={(e) => set('templateId', e.target.value)}>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Lời nhắn" optional hint={`${v.message.length}/500`}>
            <Textarea maxLength={500} rows={3} value={v.message} onChange={(e) => set('message', e.target.value)} />
          </Field>
          <div className={s.row}>
            <Field label="Điểm hẹn" optional>
              <Select value={v.meetingPoiId} onChange={(e) => set('meetingPoiId', e.target.value)}>
                <option value="">— Không —</option>
                {pois.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Giờ hẹn" optional>
              <Input placeholder="16h00" value={v.meetingTime} disabled={!v.meetingPoiId} onChange={(e) => set('meetingTime', e.target.value)} />
            </Field>
          </div>
          <Field label="Số điện thoại" optional hint="Hiện nút Gọi trên thiệp.">
            <Input inputMode="tel" value={v.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <div className={s.formActions}>
            <span aria-live="polite">
              {status === 'saved' && <span className={s.saved}>✓ Đã lưu</span>}
              {status === 'error' && <span style={{ color: '#b42318', fontWeight: 600 }}>Chưa lưu được, kiểm tra lại thông tin.</span>}
            </span>
            <Button type="submit" disabled={busy || !dirty} leading={<Icon name="check" size={16} />}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</Button>
          </div>
        </form>
      </Surface>

      <Surface as="section" className={s.danger}>
        <h2 className={s.h2}>Xoá thiệp</h2>
        <p style={{ color: 'var(--fg-muted)', marginBottom: 12 }}>Thiệp tự xoá 30 ngày sau lễ. Muốn xoá ngay thì bấm bên dưới: link thiệp, RSVP và người nhận đều mất.</p>
        <Button type="button" variant="danger" onClick={del} leading={<Icon name="trash" size={16} />}>Xoá thiệp vĩnh viễn</Button>
      </Surface>
    </>
  );
}
