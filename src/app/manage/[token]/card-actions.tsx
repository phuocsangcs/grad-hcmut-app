'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/components/api';
import { fromVnLocalInput } from '@/lib/time';
import { PhotoUploader, type UploadedPhoto } from '@/app/create/photo-uploader';
import { Button, Field, FormSection, Icon, Input, Select, Surface, Textarea } from '@/ui';
import s from './manage.module.css';

type Current = {
  templateId: string;
  message: string;
  displayName: string;
  meetingPoiId: string;
  meetingTime: string;
  phone: string;
  uploads: UploadedPhoto[];
  beforeTime: string;
  afterTime: string;
  musicId: string;
  rsvpEnabled: boolean;
  /** Giờ Việt Nam dạng YYYY-MM-DDTHH:mm, rỗng = không đặt hạn. */
  rsvpDeadline: string;
  rsvpMaxHeadcount: number;
  guestbookEnabled: boolean;
};
type SectionKey = 'info' | 'photos' | 'meeting' | 'times' | 'music' | 'rsvp';
type Props = {
  token: string;
  templates: { id: string; name: string; description: string }[];
  pois: { id: string; name: string }[];
  music: { id: string; title: string }[];
  photosEnabled: boolean;
  current: Current;
};

const ERRORS: Record<string, string> = {
  photo_missing: 'Có ảnh đã hết hạn lưu tạm, hãy tải lại ảnh đó.',
  storage_disabled: 'Tính năng ảnh đang tạm tắt.',
  invalid_input: 'Chưa lưu được, kiểm tra lại thông tin.',
};

/** Sau khi lưu, ảnh mới đổi khoá từ pending/ sang cards/<id>/ (cùng tên file) → ghép lại URL cũ. */
function remapUploads(old: UploadedPhoto[], keys: string[]): UploadedPhoto[] {
  const byName = new Map(old.map((u) => [u.key.split('/').pop()!, u.url]));
  return keys.map((key) => {
    const prev = byName.get(key.split('/').pop()!) ?? '';
    return { key, url: prev ? prev.replace(/\/(pending|cards\/[^/]+)\/[^/]+$/, `/${key}`) : '' };
  });
}

/** Sửa thiệp (PATCH /api/manage/:token) và vùng xoá thiệp. */
export function CardActions({ token, templates, pois, music, photosEnabled, current }: Props) {
  const router = useRouter();
  const [base, setBase] = useState<Current>(current);
  const [v, setV] = useState<Current>(current);
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({ info: true, photos: false, meeting: false, times: false, music: false, rsvp: false });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const set = <K extends keyof Current>(k: K, val: Current[K]) => { setV((c) => ({ ...c, [k]: val })); setStatus('idle'); };
  const dirty = JSON.stringify(base) !== JSON.stringify(v);
  const openSection = (k: SectionKey) => (val: boolean) => setOpen((c) => ({ ...c, [k]: val }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = await api<{ photos: string[] }>(`/api/manage/${token}`, {
        method: 'PATCH',
        json: {
          templateId: v.templateId, message: v.message, displayName: v.displayName,
          meetingPoiId: v.meetingPoiId || null, meetingTime: v.meetingTime || null, phone: v.phone || null,
          ...(photosEnabled ? { photos: v.uploads.map((u) => u.key) } : {}),
          beforeTime: v.beforeTime || null, afterTime: v.afterTime || null,
          musicId: v.musicId || null,
          rsvpEnabled: v.rsvpEnabled,
          rsvpDeadline: fromVnLocalInput(v.rsvpDeadline),
          rsvpMaxHeadcount: v.rsvpMaxHeadcount,
          guestbookEnabled: v.guestbookEnabled,
        },
      });
      const next = photosEnabled ? { ...v, uploads: remapUploads(v.uploads, saved.photos) } : v;
      setV(next);
      setBase(next);
      setStatus('saved');
      router.refresh();
    } catch (err) {
      setMessage(err instanceof ApiError ? ERRORS[err.code] ?? ERRORS.invalid_input : ERRORS.invalid_input);
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
          <FormSection id="m-info" title="Thông tin" icon="heart" hint="Tên, mẫu, lời nhắn, số điện thoại" open={open.info} onOpenChange={openSection('info')}>
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
            <Field label="Số điện thoại" optional hint="Hiện nút Gọi trên thiệp.">
              <Input inputMode="tel" value={v.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
          </FormSection>

          {photosEnabled ? (
            <FormSection id="m-photos" title="Ảnh" icon="camera" hint={`${v.uploads.length} ảnh`} open={open.photos} onOpenChange={openSection('photos')}>
              <PhotoUploader value={v.uploads} onChange={(next) => set('uploads', next)} />
            </FormSection>
          ) : null}

          <FormSection id="m-meeting" title="Điểm hẹn sau lễ" icon="pin" hint={v.meetingPoiId ? pois.find((p) => p.id === v.meetingPoiId)?.name : 'Chưa chọn'} open={open.meeting} onOpenChange={openSection('meeting')}>
            <div className={s.row}>
              <Field label="Địa điểm" optional>
                <Select value={v.meetingPoiId} onChange={(e) => set('meetingPoiId', e.target.value)}>
                  <option value="">— Không —</option>
                  {pois.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field label="Giờ hẹn" optional>
                <Input placeholder="16h00" value={v.meetingTime} disabled={!v.meetingPoiId} onChange={(e) => set('meetingTime', e.target.value)} />
              </Field>
            </div>
          </FormSection>

          <FormSection id="m-times" title="Giờ trước lễ và sau lễ" icon="clock" hint={v.beforeTime || v.afterTime ? [v.beforeTime, v.afterTime].filter(Boolean).join(' · ') : 'Không bắt buộc'} open={open.times} onOpenChange={openSection('times')}>
            <div className={s.row}>
              <Field label="Trước lễ" optional hint="Giờ đón khách, ví dụ 07h00 – 07h30">
                <Input maxLength={30} placeholder="07h00 – 07h30" value={v.beforeTime} onChange={(e) => set('beforeTime', e.target.value)} />
              </Field>
              <Field label="Sau lễ" optional hint="Giờ chụp ảnh, gặp gỡ">
                <Input maxLength={30} placeholder="10h30 – 11h30" value={v.afterTime} onChange={(e) => set('afterTime', e.target.value)} />
              </Field>
            </div>
          </FormSection>

          {music.length > 0 ? (
            <FormSection id="m-music" title="Nhạc nền" icon="sparkle" hint={music.find((m) => m.id === v.musicId)?.title ?? 'Không dùng nhạc'} open={open.music} onOpenChange={openSection('music')}>
              <Field label="Bài nhạc" optional hint="Khách bấm vào thiệp thì nhạc bắt đầu phát, tắt được bất cứ lúc nào.">
                <Select value={v.musicId} onChange={(e) => set('musicId', e.target.value)}>
                  <option value="">— Không dùng nhạc —</option>
                  {music.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </Select>
              </Field>
            </FormSection>
          ) : null}

          <FormSection
            id="m-rsvp" title="Xác nhận tham dự và lưu bút" icon="users" hint={v.rsvpEnabled ? 'Đang nhận xác nhận' : 'Đã tắt'}
            open={open.rsvp} onOpenChange={openSection('rsvp')} enabled={v.rsvpEnabled} onEnabledChange={(on) => set('rsvpEnabled', on)} switchLabel="Nhận"
          >
            <div className={s.row}>
              <Field label="Hạn chót" optional hint="Quá hạn, nút xác nhận sẽ đóng.">
                <Input type="datetime-local" value={v.rsvpDeadline} onChange={(e) => set('rsvpDeadline', e.target.value)} />
              </Field>
              <Field label="Số người tối đa mỗi lần báo">
                <Select value={String(v.rsvpMaxHeadcount)} onChange={(e) => set('rsvpMaxHeadcount', Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 20].map((n) => <option key={n} value={n}>{n} người</option>)}
                </Select>
              </Field>
            </div>
            <label className={s.check}>
              <input type="checkbox" checked={v.guestbookEnabled} onChange={(e) => set('guestbookEnabled', e.target.checked)} />
              <span>Hiện lời chúc của khách công khai trên thiệp (lưu bút). Bạn vẫn ẩn được từng lời chúc ở danh sách phía trên.</span>
            </label>
          </FormSection>

          <div className={s.formActions}>
            <span aria-live="polite">
              {status === 'saved' && <span className={s.saved}>✓ Đã lưu</span>}
              {status === 'error' && <span style={{ color: '#b42318', fontWeight: 600 }}>{message}</span>}
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
