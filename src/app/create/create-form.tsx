'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/components/api';
import type { Faculty, GreetingGroup, Poi, Template } from '@/modules/content';
import { vi } from '@/lib/i18n';
import { formatDateVi, formatTimeVi, vnDate } from '@/lib/time';
import { Button, Field, Icon, Input, Select, Textarea } from '@/ui';
import { PhonePreview, type PreviewDraft } from './preview';
import s from './create.module.css';

type Props = {
  faculties: Faculty[];
  templates: Template[];
  pois: Poi[];
  groups: GreetingGroup[];
  suggestions: string[];
  defaultTemplateId: string;
};

type Draft = PreviewDraft & { ownerEmail: string };

const DRAFT_KEY = 'grad.createDraft';
const STEPS = [
  { key: 'who', label: 'Bạn là ai', hint: 'Tên & khoa' },
  { key: 'look', label: 'Chọn mẫu', hint: 'Diện mạo thiệp' },
  { key: 'send', label: 'Lời nhắn', hint: 'Điểm hẹn & đường dẫn' },
] as const;

type SlugState = { available: true; slug: string } | { available: false; slug: string; reason: string; suggestions: string[] } | null;

/** Bỏ dấu + chuẩn hoá tên thành gợi ý đường dẫn: "Nguyễn Minh Anh" → "minh-anh". */
function slugFromName(name: string): string {
  const parts = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts.slice(-2).join('-');
}

/**
 * Wizard 3 bước, xem trước sống bằng chính template thật.
 * Nháp lưu localStorage; API: /api/cards/check-slug, POST /api/cards.
 */
export function CreateForm(p: Props) {
  const router = useRouter();
  const [d, setD] = useState<Draft>({
    displayName: '', facultyId: p.faculties[0]?.id ?? '', templateId: p.defaultTemplateId, message: '',
    slug: '', meetingPoiId: '', meetingTime: '', phone: '', ownerEmail: '', greetings: {},
  });
  const [step, setStep] = useState(0);
  const [slugResult, setSlugResult] = useState<{ q: string; r: SlugState } | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTo, setPreviewTo] = useState(p.groups[0]?.key ?? 'parents');
  const [sheetOpen, setSheetOpen] = useState(false);

  // khôi phục nháp sau hydrate (trì hoãn một frame để không setState đồng bộ trong effect)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Draft>;
          setD((cur) => ({ ...cur, ...saved }));
          if (saved.slug) setSlugTouched(true);
        }
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
  }, [d]);

  const faculty = useMemo(() => p.faculties.find((f) => f.id === d.facultyId), [p.faculties, d.facultyId]);
  const ceremonyAt = useMemo(() => (faculty ? vnDate(faculty.date, faculty.time) : null), [faculty]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));

  // đổi tên → gợi ý đường dẫn, nếu người dùng chưa tự gõ
  const setName = (name: string) => setD((cur) => ({ ...cur, displayName: name, slug: slugTouched ? cur.slug : slugFromName(name) }));

  // kiểm tra slug khi gõ (debounce)
  useEffect(() => {
    if (!d.slug.trim()) return;
    const t = setTimeout(async () => {
      try {
        const r = await api<SlugState>(`/api/cards/check-slug?slug=${encodeURIComponent(d.slug)}&facultyId=${d.facultyId}`);
        setSlugResult({ q: d.slug, r });
      } catch { setSlugResult(null); }
    }, 300);
    return () => clearTimeout(t);
  }, [d.slug, d.facultyId]);
  // chỉ dùng kết quả khớp với slug đang gõ (tránh hiện kết quả cũ)
  const slugState: SlugState = slugResult && d.slug.trim() && slugResult.q === d.slug ? slugResult.r : null;

  const step1Ok = d.displayName.trim().length >= 2 && !!faculty;
  const canSubmit = step1Ok && d.slug.trim().length > 0 && (slugState === null || slugState.available);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
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
      if (code.startsWith('slug')) setStep(2);
    } finally { setBusy(false); }
  }

  const previewProps = { draft: d, to: previewTo };

  return (
    <div className={s.layout}>
      <form onSubmit={submit} className={s.form} noValidate>
        <ol className={s.steps} aria-label="Các bước">
          {STEPS.map((st, i) => (
            <li key={st.key}>
              <button
                type="button"
                className={s.step}
                aria-current={i === step ? 'step' : undefined}
                data-done={i < step}
                disabled={i > step && !step1Ok}
                onClick={() => setStep(i)}
              >
                Bước {i + 1}
                <strong>{st.label}</strong>
              </button>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section className={s.panel} aria-labelledby="st-who">
            <div>
              <h2 id="st-who" className={s.panelTitle}>Bạn là ai?</h2>
              <p className={s.panelLead}>Tên sẽ in to trên thiệp. Chọn khoa để lấy đúng ngày giờ lễ.</p>
            </div>
            <Field label="Tên hiển thị" hint="Tên đầy đủ hoặc tên thân mật, tối đa 60 ký tự.">
              <Input required maxLength={60} autoFocus value={d.displayName} placeholder="Nguyễn Minh Anh" onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Khoa">
              <Select value={d.facultyId} onChange={(e) => set('facultyId', e.target.value)}>
                {p.faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </Select>
            </Field>
            {faculty && ceremonyAt && (
              <dl className={s.ceremony}>
                <div><dt>Ngày lễ</dt><dd>{formatDateVi(ceremonyAt)}</dd></div>
                <div><dt>Giờ</dt><dd>{formatTimeVi(ceremonyAt)}</dd></div>
                <div><dt>Nơi</dt><dd>{faculty.venue ?? 'Hội trường A5'}</dd></div>
                <p className={s.ceremonyNote}>Theo lịch chính thức của trường. {faculty.degreeTitle} · {faculty.tagline}</p>
              </dl>
            )}
          </section>
        )}

        {step === 1 && (
          <section className={s.panel} aria-labelledby="st-look">
            <div>
              <h2 id="st-look" className={s.panelTitle}>Chọn mẫu thiệp</h2>
              <p className={s.panelLead}>Mẫu nào cũng tự đổi màu và hoạ tiết theo khoa của bạn. Đổi được sau.</p>
            </div>
            <ul className={s.templates}>
              {p.templates.map((t) => {
                const on = d.templateId === t.id;
                return (
                  <li key={t.id}>
                    {/* div role=button: bên trong có preview chứa <button> thật, không được lồng button. */}
                    <div
                      role="button"
                      tabIndex={0}
                      className={s.templateCard}
                      aria-pressed={on}
                      onClick={() => set('templateId', t.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set('templateId', t.id); }
                      }}
                    >
                      <div className={s.templateThumb} aria-hidden="true">
                        <PhonePreview draft={d} templateId={t.id} to={previewTo} scale={0.34} interactive={false} />
                      </div>
                      <span className={s.templateName}>
                        {t.name}
                        {on ? <span className={s.check}><Icon name="check" size={13} /></span> : null}
                      </span>
                      <span className={s.templateDesc}>{t.description}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {step === 2 && (
          <section className={s.panel} aria-labelledby="st-send">
            <div>
              <h2 id="st-send" className={s.panelTitle}>Lời nhắn & đường dẫn</h2>
              <p className={s.panelLead}>Để trống lời nhắn thì thiệp dùng lời mời mặc định của khoa.</p>
            </div>
            <Field label="Lời nhắn chung" optional hint={`${d.message.length}/500`}>
              <Textarea maxLength={500} rows={3} value={d.message} placeholder={faculty?.invitation} onChange={(e) => set('message', e.target.value)} />
            </Field>
            <div className={s.chips} aria-label="Gợi ý lời nhắn">
              {p.suggestions.map((sg) => (
                <button type="button" key={sg} className={s.chipBtn} onClick={() => set('message', sg)}>{sg}</button>
              ))}
            </div>
            <details className={s.groups}>
              <summary>
                <span>Lời chào riêng theo nhóm <small>Ba Mẹ, Ông Bà, bạn bè… mỗi nhóm một câu mở đầu</small></span>
              </summary>
              <div className={s.groupsBody}>
                {p.groups.map((g) => (
                  <Field key={g.key} label={g.label}>
                    <Input placeholder={g.greeting} value={d.greetings[g.key] ?? ''} onChange={(e) => set('greetings', { ...d.greetings, [g.key]: e.target.value })} />
                  </Field>
                ))}
              </div>
            </details>

            <div className={s.row}>
              <Field label="Điểm hẹn sau lễ" optional hint="Nơi gặp nhau để chụp hình, có chỉ đường trên thiệp.">
                <Select value={d.meetingPoiId} onChange={(e) => set('meetingPoiId', e.target.value)}>
                  <option value="">— Chưa chọn —</option>
                  {p.pois.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </Select>
              </Field>
              <Field label="Giờ hẹn" optional>
                <Input placeholder="16h00" value={d.meetingTime} disabled={!d.meetingPoiId} onChange={(e) => set('meetingTime', e.target.value)} />
              </Field>
            </div>
            <div className={s.row}>
              <Field label="Số điện thoại" optional hint="Hiện nút Gọi trên thiệp cho người lớn tuổi.">
                <Input inputMode="tel" placeholder="09xxxxxxxx" value={d.phone} onChange={(e) => set('phone', e.target.value)} />
              </Field>
              <Field label="Email" optional hint="Để lấy lại link quản lý nếu lỡ mất.">
                <Input type="email" value={d.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} />
              </Field>
            </div>

            <Field
              label="Đường dẫn thiệp"
              hint={
                slugState
                  ? slugState.available
                    ? <span className={s.slugOk}>✓ /{slugState.slug} còn trống</span>
                    : <span className={s.slugBad}>
                        {slugState.reason === 'taken' ? vi.errors.slugTaken : slugState.reason === 'reserved' ? vi.errors.slugReserved : vi.errors.slugInvalid}
                        {slugState.suggestions.length > 0 && (
                          <span className={s.slugSuggest}>
                            {slugState.suggestions.map((sg) => <button type="button" key={sg} onClick={() => { setSlugTouched(true); set('slug', sg); }}>{sg}</button>)}
                          </span>
                        )}
                      </span>
                  : 'Chữ thường, số và dấu gạch ngang. Ví dụ: minh-anh-k22'
              }
            >
              <span className={s.slugWrap}>
                <span className={s.slugPrefix}>ngayratruong.vn/</span>
                <input
                  className={s.slugInput}
                  required
                  value={d.slug}
                  placeholder="minh-anh"
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }}
                />
              </span>
            </Field>
          </section>
        )}

        {error && <p role="alert" className={s.error}>{error}</p>}

        <div className={s.nav}>
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} leading={<Icon name="arrow" size={16} style={{ transform: 'rotate(180deg)' }} />}>Quay lại</Button>
          ) : <span />}
          {step < STEPS.length - 1 ? (
            <Button type="submit" disabled={!step1Ok} trailing={<Icon name="arrow" size={16} />}>Tiếp tục</Button>
          ) : (
            <Button type="submit" size="lg" disabled={busy || !canSubmit} trailing={<Icon name="check" size={16} />}>{busy ? 'Đang tạo…' : 'Tạo thiệp'}</Button>
          )}
        </div>
      </form>

      <aside className={s.aside} aria-label="Xem trước">
        <div className={s.asideBar}>
          <span>Xem trước · <strong>{p.templates.find((t) => t.id === d.templateId)?.name}</strong></span>
          <span className={s.toSelect} role="group" aria-label="Xem với tư cách">
            {p.groups.map((g) => (
              <button type="button" key={g.key} aria-pressed={previewTo === g.key} onClick={() => setPreviewTo(g.key)}>{g.label}</button>
            ))}
          </span>
        </div>
        <PhonePreview {...previewProps} scale={0.92} />
      </aside>

      <Button className={s.mobilePreviewBtn} variant="secondary" type="button" onClick={() => setSheetOpen(true)} leading={<Icon name="eye" size={16} />}>Xem trước</Button>
      <div className={s.sheet} data-open={sheetOpen} role="dialog" aria-modal="true" aria-label="Xem trước thiệp">
        <div className={s.sheetBar}>
          <span>Xem trước</span>
          <Button variant="white" size="sm" type="button" onClick={() => setSheetOpen(false)}>Đóng</Button>
        </div>
        <div className={s.sheetBody}>{sheetOpen ? <PhonePreview {...previewProps} frame={false} /> : null}</div>
      </div>
    </div>
  );
}
