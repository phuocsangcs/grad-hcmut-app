'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/components/api';
import { Button, CopyButton, Field, Icon, Input, Select, Textarea } from '@/ui';
import { LeadField, leadValue } from './lead-field';
import type { GuestDefaults, GuestRow } from './types';
import s from './invites.module.css';

type Filter = 'all' | 'unopened' | 'opened' | 'confirmed' | 'pending';
const FILTERS: { id: Filter; label: string; test: (g: GuestRow) => boolean }[] = [
  { id: 'all', label: 'Tất cả', test: () => true },
  { id: 'unopened', label: 'Chưa mở', test: (g) => g.views === 0 },
  { id: 'opened', label: 'Đã mở', test: (g) => g.views > 0 },
  { id: 'confirmed', label: 'Tham dự', test: (g) => !!g.rsvp },
  { id: 'pending', label: 'Chưa phản hồi', test: (g) => !g.rsvp },
];

/** Bỏ dấu để tìm "co hoa" ra "Cô Hoa". */
const fold = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/** Cột phải: tìm kiếm, lọc, bảng khách và các thao tác từng dòng. */
export function GuestList({ token, guests, defaults }: { token: string; guests: GuestRow[]; defaults: GuestDefaults }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<GuestRow | null>(null);
  const [qr, setQr] = useState<GuestRow | null>(null);

  const shown = useMemo(() => {
    const needle = fold(q.trim());
    const test = FILTERS.find((f) => f.id === filter)!.test;
    return guests.filter((g) => test(g) && (!needle || fold(`${g.name} ${g.greeting ?? ''} ${g.message ?? ''} ${g.code}`).includes(needle)));
  }, [guests, q, filter]);

  return (
    <section className={s.panel} aria-labelledby="guest-list-title">
      <div className={s.listHead}>
        <div>
          <h2 id="guest-list-title" className={s.panelTitle}>
            Danh sách khách
          </h2>
          <p className={s.muted}>
            {shown.length} / {guests.length} khách
          </p>
        </div>
        <label className={s.search}>
          <Icon name="search" size={16} />
          <span className="sr-only">Tìm khách</span>
          <input type="search" value={q} placeholder="Tìm tên, câu mời, lời nhắn" onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      <div className={s.filters} role="group" aria-label="Lọc khách">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={s.filter} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
            <span>{guests.filter(f.test).length}</span>
          </button>
        ))}
      </div>

      {guests.length === 0 ? (
        <div className={s.empty}>
          <p>
            <strong>Chưa có khách nào.</strong>
          </p>
          <p>Thêm từng người ở khung bên trái, hoặc dán cả danh sách bằng Nhập hàng loạt.</p>
        </div>
      ) : shown.length === 0 ? (
        <div className={s.empty}>
          <p>Không có khách khớp bộ lọc.</p>
        </div>
      ) : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Tên</th>
                <th>Lời mời</th>
                <th>Đường dẫn</th>
                <th>RSVP</th>
                <th className={s.num}>SL</th>
                <th>
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((g) => (
                <tr key={g.id}>
                  <td data-label="Tên">
                    <div className={s.name}>{g.name}</div>
                    <div className={s.code} title={g.url}>
                      /{g.code}
                    </div>
                  </td>
                  <td data-label="Lời mời">
                    <div className={s.lead}>{g.greeting ?? <span className={s.dim}>{defaults.lead}</span>}</div>
                    <div className={s.msgCell} title={g.message ?? undefined}>
                      {g.message ?? <span className={s.dim}>Lời nhắn chung</span>}
                    </div>
                  </td>
                  <td data-label="Đường dẫn">
                    <div className={s.linkBtns}>
                      <CopyButton text={g.url} size="sm" variant="primary" label="Sao chép" doneLabel="Đã chép" />
                      <Button type="button" size="sm" variant="secondary" onClick={() => setQr(g)} leading={<Icon name="qr" size={14} />}>
                        Mã QR
                      </Button>
                      <Button href={g.url} target="_blank" size="sm" variant="secondary" leading={<Icon name="external" size={14} />}>
                        Mở
                      </Button>
                    </div>
                  </td>
                  <td data-label="RSVP">
                    <div className={s.badges}>
                      <span className={g.views > 0 ? s.badgeInfo : s.badgeMuted}>{g.views > 0 ? `Đã mở · ${g.views}` : 'Chưa mở'}</span>
                      <span className={g.rsvp ? s.badgeOk : s.badgeMuted}>{g.rsvp ? 'Tham dự' : 'Chưa phản hồi'}</span>
                    </div>
                    {g.rsvp?.wish ? <p className={s.wish}>“{g.rsvp.wish}”</p> : null}
                  </td>
                  <td data-label="SL" className={s.num}>
                    {g.rsvp?.headcount ?? 0}
                  </td>
                  <td className={s.menuCell}>
                    <RowMenu token={token} guest={g} onEdit={() => setEditing(g)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing ? <EditDialog token={token} guest={editing} defaults={defaults} onClose={() => setEditing(null)} /> : null}
      {qr ? <QrDialog guest={qr} slug={defaults.slug} onClose={() => setQr(null)} /> : null}
    </section>
  );
}

/** Nút ⋯: Sửa, Gửi, Xoá. Đóng khi bấm ra ngoài hoặc Esc. */
function RowMenu({ token, guest, onEdit }: { token: string; guest: GuestRow; onEdit: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const off = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', off);
    document.addEventListener('keydown', off);
    return () => {
      document.removeEventListener('pointerdown', off);
      document.removeEventListener('keydown', off);
    };
  }, [open]);

  async function share() {
    setOpen(false);
    if (typeof navigator.share === 'function') await navigator.share({ url: guest.url, title: `Thiệp mời ${guest.name}` }).catch(() => {});
    else await navigator.clipboard.writeText(guest.url).catch(() => {});
  }
  async function remove() {
    setOpen(false);
    if (!confirm(`Xoá ${guest.name}? Link riêng của người này sẽ hết hiệu lực.`)) return;
    await api(`/api/manage/${token}/invites/${guest.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className={s.menu} ref={box}>
      <button type="button" className={s.menuBtn} aria-haspopup="menu" aria-expanded={open} aria-label={`Thao tác với ${guest.name}`} onClick={() => setOpen((v) => !v)}>
        <Icon name="more" size={18} />
      </button>
      {open ? (
        <div className={s.menuList} role="menu">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(); }}>
            <Icon name="edit" size={16} /> Sửa
          </button>
          <button type="button" role="menuitem" onClick={share}>
            <Icon name="share" size={16} /> Gửi Zalo / Messenger
          </button>
          <button type="button" role="menuitem" className={s.danger} onClick={remove}>
            <Icon name="trash" size={16} /> Xoá khách
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Hộp thoại dựng trên <dialog> gốc: tự khoá focus, Esc để đóng. */
function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog ref={ref} className={s.dialog} aria-label={title} onClose={onClose} onClick={(e) => e.target === ref.current && ref.current?.close()}>
      <div className={s.dialogBody}>
        <header className={s.dialogHead}>
          <h3>{title}</h3>
          <button type="button" className={s.menuBtn} aria-label="Đóng" onClick={() => ref.current?.close()}>
            <Icon name="x" size={18} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

function EditDialog({ token, guest, defaults, onClose }: { token: string; guest: GuestRow; defaults: GuestDefaults; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(guest.name);
  const [lead, setLead] = useState(guest.greeting ?? '');
  const [message, setMessage] = useState(guest.message ?? '');
  const [templateId, setTemplateId] = useState(guest.templateId ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api(`/api/manage/${token}/invites/${guest.id}`, {
        method: 'PATCH',
        json: { recipientName: name.trim(), greeting: leadValue(lead), message: message.trim() || null, templateId: templateId || null },
      });
      router.refresh();
      onClose();
    } catch {
      setErr('Chưa lưu được, kiểm tra lại thông tin.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog title={`Sửa khách: ${guest.name}`} onClose={onClose}>
      <form className={s.addForm} onSubmit={save}>
        <Field label="Tên khách">
          <Input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <LeadField id="edit-lead" value={lead} onChange={setLead} leads={defaults.leads} cardLead={defaults.lead} />
        <Field label="Lời nhắn riêng" optional hint={`${message.length}/500`}>
          <Textarea maxLength={500} rows={3} value={message} placeholder={defaults.message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <Field label="Mẫu thiệp riêng" hint="Người này mở link sẽ thấy mẫu này.">
          <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            <option value="">Như thiệp</option>
            {defaults.templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
        {err ? (
          <p className={s.err} role="alert">
            {err}
          </p>
        ) : null}
        <div className={s.dialogActions}>
          <Button type="submit" disabled={busy || !name.trim()}>
            {busy ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function QrDialog({ guest, slug, onClose }: { guest: GuestRow; slug: string; onClose: () => void }) {
  const src = (size: number) => `/api/cards/${slug}/qr?code=${guest.code}&size=${size}`;
  return (
    <Dialog title={`Mã QR · ${guest.name}`} onClose={onClose}>
      <div className={s.qrBox}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR sinh động từ API */}
        <img src={src(440)} alt={`Mã QR mở thiệp của ${guest.name}`} width={220} height={220} />
        <p className={s.code}>{guest.url}</p>
        <div className={s.dialogActions}>
          <Button href={src(1024)} download={`qr-${slug}-${guest.code}.png`} leading={<Icon name="download" size={16} />}>
            Tải ảnh QR
          </Button>
          <CopyButton text={guest.url} label="Chép link" />
        </div>
      </div>
    </Dialog>
  );
}
