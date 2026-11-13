'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/components/api';
import type { Faculty, GreetingGroup, Poi, Template } from '@/modules/content';
import { vi } from '@/lib/i18n';

type Props = {
  faculties: Faculty[];
  templates: Template[];
  pois: Poi[];
  groups: GreetingGroup[];
  suggestions: string[];
  defaultTemplateId: string;
};

type Draft = {
  displayName: string;
  facultyId: string;
  templateId: string;
  message: string;
  slug: string;
  meetingPoiId: string;
  meetingTime: string;
  phone: string;
  ownerEmail: string;
  greetings: Record<string, string>;
};

const DRAFT_KEY = 'grad.createDraft';

type SlugState = { available: true; slug: string } | { available: false; slug: string; reason: string; suggestions: string[] } | null;

/** Wizard 3 bước gộp 1 trang (UI trần). Lưu nháp localStorage. */
export function CreateForm(p: Props) {
  const router = useRouter();
  const [d, setD] = useState<Draft>({
    displayName: '', facultyId: p.faculties[0]?.id ?? '', templateId: p.defaultTemplateId, message: '',
    slug: '', meetingPoiId: '', meetingTime: '', phone: '', ownerEmail: '', greetings: {},
  });
  const [slugState, setSlugState] = useState<SlugState>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // khôi phục nháp sau hydrate (trì hoãn một frame để không setState đồng bộ trong effect)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) setD((cur) => ({ ...cur, ...JSON.parse(raw) }));
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
  }, [d]);

  const faculty = useMemo(() => p.faculties.find((f) => f.id === d.facultyId), [p.faculties, d.facultyId]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));

  // kiểm tra slug khi gõ (debounce)
  useEffect(() => {
    if (!d.slug.trim()) return;
    const t = setTimeout(async () => {
      try {
        setSlugState(await api(`/api/cards/check-slug?slug=${encodeURIComponent(d.slug)}&facultyId=${d.facultyId}`));
      } catch { setSlugState(null); }
    }, 300);
    return () => clearTimeout(t);
  }, [d.slug, d.facultyId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await api<{ slug: string; url: string; manageToken: string; manageUrl: string }>('/api/cards', {
        method: 'POST',
        json: {
          displayName: d.displayName, facultyId: d.facultyId, templateId: d.templateId, message: d.message,
          slug: d.slug, greetings: d.greetings,
          meetingPoiId: d.meetingPoiId || null, meetingTime: d.meetingTime || null,
          phone: d.phone || null, ownerEmail: d.ownerEmail || null,
        },
      });
      try { localStorage.removeItem(DRAFT_KEY); sessionStorage.setItem('grad.created', JSON.stringify(r)); } catch {}
      router.push('/create/done');
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'server_error';
      const map: Record<string, string> = {
        slug_taken: vi.errors.slugTaken, slug_invalid: vi.errors.slugInvalid, slug_reserved: vi.errors.slugReserved,
        invalid_input: vi.errors.invalidInput, rate_limited: vi.errors.rateLimited,
      };
      setError(map[code] ?? vi.errors.server);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit}>
      <h2>Bước 1 · Bạn là ai</h2>
      <label>Tên hiển thị <input required maxLength={60} value={d.displayName} onChange={(e) => set('displayName', e.target.value)} /></label>
      <label>Khoa
        <select value={d.facultyId} onChange={(e) => set('facultyId', e.target.value)}>
          {p.faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </label>
      {faculty && <p>Lễ: {faculty.date} · {faculty.time} · {faculty.venue ?? 'Hội trường A5'} (sửa được sau trong trang quản lý)</p>}

      <h2>Bước 2 · Chọn mẫu</h2>
      {p.templates.map((t) => (
        <label key={t.id} style={{ display: 'block' }}>
          <input type="radio" name="template" checked={d.templateId === t.id} onChange={() => set('templateId', t.id)} /> {t.name} — {t.description}
        </label>
      ))}

      <h2>Bước 3 · Lời nhắn · Điểm hẹn · Đường dẫn</h2>
      <label>Lời nhắn chung<br />
        <textarea maxLength={500} rows={3} value={d.message} onChange={(e) => set('message', e.target.value)} />
      </label>
      <p>Gợi ý: {p.suggestions.map((s) => <button type="button" key={s} onClick={() => set('message', s)}>{s.slice(0, 30)}…</button>)}</p>
      <details>
        <summary>Lời chào riêng theo nhóm (tuỳ chọn)</summary>
        {p.groups.map((g) => (
          <label key={g.key} style={{ display: 'block' }}>{g.label}: <input placeholder={g.greeting} value={d.greetings[g.key] ?? ''} onChange={(e) => set('greetings', { ...d.greetings, [g.key]: e.target.value })} /></label>
        ))}
      </details>
      <label>Điểm hẹn
        <select value={d.meetingPoiId} onChange={(e) => set('meetingPoiId', e.target.value)}>
          <option value="">— không —</option>
          {p.pois.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </label>
      <label>Giờ hẹn <input placeholder="16h00" value={d.meetingTime} onChange={(e) => set('meetingTime', e.target.value)} /></label>
      <label>SĐT (nút gọi) <input placeholder="09xxxxxxxx" value={d.phone} onChange={(e) => set('phone', e.target.value)} /></label>
      <label>Đường dẫn: /<input required value={d.slug} onChange={(e) => { set('slug', e.target.value); if (!e.target.value.trim()) setSlugState(null); }} placeholder="sang-k21" /></label>
      {slugState && (slugState.available
        ? <p>✓ /{slugState.slug} còn trống</p>
        : <p>✗ {slugState.reason === 'taken' ? vi.errors.slugTaken : slugState.reason === 'reserved' ? vi.errors.slugReserved : vi.errors.slugInvalid}
            {slugState.suggestions.length > 0 && <> · gợi ý: {slugState.suggestions.map((s) => <button type="button" key={s} onClick={() => set('slug', s)}>{s}</button>)}</>}
          </p>)}
      <label>Email (tuỳ chọn, để lấy lại link quản lý) <input type="email" value={d.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} /></label>

      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={busy || (slugState !== null && !slugState.available)}>{busy ? 'Đang tạo…' : 'Tạo thiệp'}</button>
    </form>
  );
}
