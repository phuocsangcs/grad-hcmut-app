'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/components/api';
import type { Faculty, GreetingGroup, Poi, Template } from '@/modules/content';
import { vi } from '@/lib/i18n';
import { formatDateVi, formatTimeVi, fromVnLocalInput, vnDate } from '@/lib/time';
import { Button, Field, FormSection, Icon, Input, Select, Textarea } from '@/ui';
import { PhotoUploader, type UploadedPhoto } from './photo-uploader';
import { PhonePreview, type PreviewDraft } from './preview';
import s from './create.module.css';

type Props = {
  faculties: Faculty[];
  templates: Template[];
  pois: Poi[];
  groups: GreetingGroup[];
  suggestions: string[];
  defaultTemplateId: string;
  /** Mẫu vừa chọn ở /templates (?template=...), thắng nháp đã lưu. */
  initialTemplateId?: string;
  /** Đã cấu hình R2 chưa. Chưa thì ẩn khối Ảnh. */
  photosEnabled?: boolean;
  /** Danh sách nhạc nền có sẵn. Rỗng thì ẩn khối Nhạc nền. */
  music?: { id: string; title: string }[];
};

/** Công tắc của các khối tuỳ chọn. Tắt = không gửi và không hiện trên thiệp. */
type Sections = { message: boolean; meeting: boolean; contact: boolean; photos: boolean; times: boolean; music: boolean; rsvp: boolean };
type SectionKey = 'basic' | 'ceremony' | 'message' | 'photos' | 'times' | 'meeting' | 'music' | 'contact' | 'rsvp' | 'link';
type Draft = PreviewDraft & {
  ownerEmail: string;
  sections: Sections;
  uploads: UploadedPhoto[];
  beforeTime: string;
  afterTime: string;
  musicId: string;
  /** Giờ Việt Nam dạng YYYY-MM-DDTHH:mm, rỗng = không đặt hạn. */
  rsvpDeadline: string;
  rsvpMaxHeadcount: number;
  guestbookEnabled: boolean;
};

const DRAFT_KEY = 'grad.createDraft';
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
 * Form một trang gồm các khối xổ xuống (mẫu đã chọn ở /templates), xem trước sống bằng chính template thật.
 * Nháp lưu localStorage; API: /api/cards/check-slug, POST /api/cards.
 */
export function CreateForm(p: Props) {
  const router = useRouter();
  const [d, setD] = useState<Draft>({
    displayName: '', facultyId: p.faculties[0]?.id ?? '', templateId: p.initialTemplateId ?? p.defaultTemplateId, message: '',
    slug: '', meetingPoiId: '', meetingTime: '', phone: '', ownerEmail: '', greetings: {},
    sections: { message: false, meeting: false, contact: false, photos: false, times: false, music: false, rsvp: true },
    uploads: [], beforeTime: '', afterTime: '', musicId: '', rsvpDeadline: '', rsvpMaxHeadcount: 20, guestbookEnabled: false,
  });
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({ basic: true, ceremony: false, message: false, photos: false, times: false, meeting: false, music: false, contact: false, rsvp: false, link: true });
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
          // Gộp công tắc để nháp cũ (thiếu khoá mới) vẫn giữ giá trị mặc định của khoá mới.
          setD((cur) => ({ ...cur, ...saved, sections: { ...cur.sections, ...saved.sections }, ...(p.initialTemplateId ? { templateId: p.initialTemplateId } : {}) }));
          if (saved.slug) setSlugTouched(true);
        }
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ khôi phục một lần khi mở trang
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

  // Giá trị thật sự dùng cho thiệp: khối nào tắt thì coi như để trống.
  const eff = useMemo<Draft>(() => ({
    ...d,
    message: d.sections.message ? d.message : '',
    greetings: d.sections.message ? d.greetings : {},
    meetingPoiId: d.sections.meeting ? d.meetingPoiId : '',
    meetingTime: d.sections.meeting ? d.meetingTime : '',
    phone: d.sections.contact ? d.phone : '',
    photos: p.photosEnabled && d.sections.photos ? d.uploads.map((u) => u.url) : [],
    beforeTime: d.sections.times ? d.beforeTime : '',
    afterTime: d.sections.times ? d.afterTime : '',
    musicId: d.sections.music ? d.musicId : '',
    rsvpEnabled: d.sections.rsvp,
    rsvpDeadline: d.sections.rsvp ? fromVnLocalInput(d.rsvpDeadline) ?? '' : '',
    guestbookEnabled: d.sections.rsvp && d.guestbookEnabled,
  }), [d, p.photosEnabled]);
  const setSection = (k: keyof Sections, on: boolean) => {
    setD((cur) => ({ ...cur, sections: { ...cur.sections, [k]: on } }));
    setOpen((cur) => ({ ...cur, [k]: on }));
  };
  const openSection = (k: SectionKey) => (v: boolean) => setOpen((cur) => ({ ...cur, [k]: v }));

  const infoOk = d.displayName.trim().length >= 2 && !!faculty;
  const canSubmit = infoOk && d.slug.trim().length > 0 && (slugState === null || slugState.available);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true); setError(null);
    try {
      const r = await api<{ slug: string; url: string; manageToken: string; manageUrl: string }>('/api/cards', {
        method: 'POST',
        json: {
          displayName: eff.displayName, facultyId: eff.facultyId, templateId: eff.templateId, message: eff.message,
          slug: eff.slug, greetings: eff.greetings,
          meetingPoiId: eff.meetingPoiId || null, meetingTime: eff.meetingTime || null,
          phone: eff.phone || null, ownerEmail: eff.ownerEmail || null,
          photos: p.photosEnabled && d.sections.photos ? d.uploads.map((u) => u.key) : [],
          beforeTime: eff.beforeTime || null, afterTime: eff.afterTime || null,
          musicId: eff.musicId || null,
          rsvpEnabled: d.sections.rsvp, rsvpDeadline: d.sections.rsvp ? fromVnLocalInput(d.rsvpDeadline) : null, rsvpMaxHeadcount: d.rsvpMaxHeadcount,
          guestbookEnabled: eff.guestbookEnabled ?? false,
        },
      });
      try { localStorage.removeItem(DRAFT_KEY); sessionStorage.setItem('grad.created', JSON.stringify(r)); } catch {}
      router.push('/create/done');
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'server_error';
      const map: Record<string, string> = {
        slug_taken: vi.errors.slugTaken, slug_invalid: vi.errors.slugInvalid, slug_reserved: vi.errors.slugReserved,
        invalid_input: vi.errors.invalidInput, rate_limited: vi.errors.rateLimited,
        photo_missing: 'Có ảnh đã hết hạn lưu tạm, bạn tải lại ảnh nhé.',
        storage_disabled: 'Tính năng ảnh đang tạm tắt, hãy tắt khối Ảnh rồi thử lại.',
      };
      setError(map[code] ?? vi.errors.server);
      if (code === 'photo_missing') set('uploads', []);
      if (code.startsWith('slug')) setOpen((cur) => ({ ...cur, link: true }));
    } finally { setBusy(false); }
  }

  const previewProps = { draft: eff, to: previewTo };

  return (
    <div className={s.layout}>
      <form onSubmit={submit} className={s.form} noValidate>
        <FormSection id="sec-basic" title="Thông tin cơ bản" icon="heart" hint="Tên và khoa" open={open.basic} onOpenChange={openSection('basic')}>
          <Field label="Tên hiển thị" hint="Tên đầy đủ hoặc tên thân mật, tối đa 60 ký tự.">
            <Input required maxLength={60} autoFocus value={d.displayName} placeholder="Nguyễn Minh Anh" onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Khoa">
            <Select value={d.facultyId} onChange={(e) => set('facultyId', e.target.value)}>
              {p.faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </Select>
          </Field>
        </FormSection>

        <FormSection id="sec-ceremony" title="Lễ và thời gian" icon="calendar" hint={faculty && ceremonyAt ? `${formatDateVi(ceremonyAt)} · ${formatTimeVi(ceremonyAt)}` : undefined} open={open.ceremony} onOpenChange={openSection('ceremony')}>
          {faculty && ceremonyAt ? (
            <dl className={s.ceremony}>
              <div><dt>Ngày lễ</dt><dd>{formatDateVi(ceremonyAt)}</dd></div>
              <div><dt>Giờ</dt><dd>{formatTimeVi(ceremonyAt)}</dd></div>
              <div><dt>Nơi</dt><dd>{faculty.venue ?? 'Hội trường A5'}</dd></div>
              <p className={s.ceremonyNote}>Tự điền theo lịch chính thức của trường, không sửa được. {faculty.degreeTitle} · {faculty.tagline}</p>
            </dl>
          ) : null}
        </FormSection>

        <FormSection
          id="sec-message" title="Lời nhắn và lời chào" icon="mail" hint={d.sections.message ? 'Lời nhắn riêng của bạn' : 'Đang dùng lời mời mặc định của khoa'}
          open={open.message} onOpenChange={openSection('message')} enabled={d.sections.message} onEnabledChange={(v) => setSection('message', v)} switchLabel="Tự viết"
        >
          {d.sections.message ? (
            <>
              <Field label="Lời nhắn chung" hint={`${d.message.length}/500`}>
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
            </>
          ) : (
            <p className={s.defaultNote}>Đang dùng lời mời mặc định của khoa:<br /><strong>{faculty?.invitation}</strong></p>
          )}
        </FormSection>

        {p.photosEnabled ? (
          <FormSection
            id="sec-photos" title="Ảnh" icon="camera" hint={d.sections.photos ? `${d.uploads.length} ảnh` : 'Không hiện trên thiệp'}
            open={open.photos} onOpenChange={openSection('photos')} enabled={d.sections.photos} onEnabledChange={(v) => setSection('photos', v)} switchLabel="Hiện"
          >
            <PhotoUploader value={d.uploads} onChange={(next) => set('uploads', next)} />
          </FormSection>
        ) : null}

        <FormSection
          id="sec-times" title="Giờ trước lễ và sau lễ" icon="clock" hint={d.sections.times ? 'Hiện trên thiệp' : 'Không bắt buộc'}
          open={open.times} onOpenChange={openSection('times')} enabled={d.sections.times} onEnabledChange={(v) => setSection('times', v)} switchLabel="Hiện"
        >
          <div className={s.row}>
            <Field label="Trước lễ" optional hint="Giờ đón khách, ví dụ 07h00 – 07h30">
              <Input maxLength={30} placeholder="07h00 – 07h30" value={d.beforeTime} onChange={(e) => set('beforeTime', e.target.value)} />
            </Field>
            <Field label="Sau lễ" optional hint="Giờ chụp ảnh, gặp gỡ">
              <Input maxLength={30} placeholder="10h30 – 11h30" value={d.afterTime} onChange={(e) => set('afterTime', e.target.value)} />
            </Field>
          </div>
        </FormSection>

        <FormSection
          id="sec-meeting" title="Điểm hẹn sau lễ" icon="pin" hint={d.sections.meeting ? 'Nơi gặp nhau để chụp ảnh' : 'Không hiện trên thiệp'}
          open={open.meeting} onOpenChange={openSection('meeting')} enabled={d.sections.meeting} onEnabledChange={(v) => setSection('meeting', v)} switchLabel="Hiện"
        >
          <div className={s.row}>
            <Field label="Địa điểm" hint="Có chỉ đường trên thiệp.">
              <Select value={d.meetingPoiId} onChange={(e) => set('meetingPoiId', e.target.value)}>
                <option value="">— Chưa chọn —</option>
                {p.pois.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </Select>
            </Field>
            <Field label="Giờ hẹn" optional>
              <Input placeholder="16h00" value={d.meetingTime} disabled={!d.meetingPoiId} onChange={(e) => set('meetingTime', e.target.value)} />
            </Field>
          </div>
        </FormSection>

        {p.music && p.music.length > 0 ? (
          <FormSection
            id="sec-music" title="Nhạc nền" icon="sparkle" hint={d.sections.music ? p.music.find((m) => m.id === d.musicId)?.title ?? 'Chọn một bài' : 'Không dùng nhạc'}
            open={open.music} onOpenChange={openSection('music')} enabled={d.sections.music} onEnabledChange={(v) => setSection('music', v)} switchLabel="Bật"
          >
            <Field label="Bài nhạc" hint="Khách bấm vào thiệp thì nhạc bắt đầu phát, tắt được bất cứ lúc nào.">
              <Select value={d.musicId} onChange={(e) => set('musicId', e.target.value)}>
                <option value="">— Chọn bài —</option>
                {p.music.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </Select>
            </Field>
          </FormSection>
        ) : null}

        <FormSection
          id="sec-contact" title="Liên hệ" icon="phone" hint={d.sections.contact ? 'Hiện nút Gọi trên thiệp' : 'Không hiện trên thiệp'}
          open={open.contact} onOpenChange={openSection('contact')} enabled={d.sections.contact} onEnabledChange={(v) => setSection('contact', v)} switchLabel="Hiện"
        >
          <Field label="Số điện thoại" hint="Hiện nút Gọi trên thiệp cho người lớn tuổi.">
            <Input inputMode="tel" placeholder="09xxxxxxxx" value={d.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
        </FormSection>

        <FormSection
          id="sec-rsvp" title="Xác nhận tham dự và lưu bút" icon="users" hint={d.sections.rsvp ? 'Đang nhận xác nhận' : 'Đã tắt'}
          open={open.rsvp} onOpenChange={openSection('rsvp')} enabled={d.sections.rsvp} onEnabledChange={(v) => setSection('rsvp', v)} switchLabel="Nhận"
        >
          <div className={s.row}>
            <Field label="Hạn chót" optional hint="Quá hạn, nút xác nhận sẽ đóng.">
              <Input type="datetime-local" value={d.rsvpDeadline} onChange={(e) => set('rsvpDeadline', e.target.value)} />
            </Field>
            <Field label="Số người tối đa mỗi lần báo">
              <Select value={String(d.rsvpMaxHeadcount)} onChange={(e) => set('rsvpMaxHeadcount', Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 8, 10, 20].map((n) => <option key={n} value={n}>{n} người</option>)}
              </Select>
            </Field>
          </div>
          <label className={s.check}>
            <input type="checkbox" checked={d.guestbookEnabled} onChange={(e) => set('guestbookEnabled', e.target.checked)} />
            <span>Hiện lời chúc của khách công khai trên thiệp (lưu bút). Bạn ẩn được từng lời chúc ở trang quản lý.</span>
          </label>
        </FormSection>

        <FormSection id="sec-link" title="Đường dẫn và riêng tư" icon="link" hint={d.slug ? `/${d.slug}` : undefined} open={open.link} onOpenChange={openSection('link')}>
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
          <Field label="Email" optional hint="Để lấy lại link quản lý nếu lỡ mất. Không hiện trên thiệp.">
            <Input type="email" value={d.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} />
          </Field>
        </FormSection>

        {error && <p role="alert" className={s.error}>{error}</p>}

        <div className={s.nav}>
          <Button type="submit" size="lg" disabled={busy || !canSubmit} trailing={<Icon name="check" size={16} />}>{busy ? 'Đang tạo…' : 'Tạo thiệp'}</Button>
        </div>
      </form>

      <aside className={s.aside} aria-label="Xem trước">
        <div className={s.asideBar}>
          <span>Mẫu <strong>{p.templates.find((t) => t.id === d.templateId)?.name}</strong> · <Link href="/templates" className={s.changeTpl}>Đổi mẫu</Link></span>
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
