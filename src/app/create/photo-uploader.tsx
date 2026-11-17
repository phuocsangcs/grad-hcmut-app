'use client';

import { useRef, useState } from 'react';
import { api, ApiError } from '@/components/api';
import { MAX_PHOTOS, PHOTO_MAX_BYTES } from '@/lib/storage-keys';
import { Icon } from '@/ui';
import s from './photo-uploader.module.css';

export type UploadedPhoto = { key: string; url: string };

/** Cạnh dài tối đa: đủ nét cho ảnh bìa tràn màn hình trên điện thoại 3x và máy tính. */
const MAX_SIDE = 2048;

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

/** Đọc ảnh bằng <img>: Safari (iPhone) đọc được HEIC theo cách này và tự xoay theo EXIF. */
function decodeWithImg(file: File): Promise<Decoded> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = 'async';
  return new Promise<Decoded>((resolve, reject) => {
    img.onload = () => resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode_failed'));
    };
    img.src = url;
  });
}

/**
 * Giải mã ảnh. createImageBitmap nhanh và nhẹ bộ nhớ nhưng trên Safari iPhone hay lỗi với ảnh HEIC
 * (định dạng mặc định của camera iPhone) hoặc ảnh quá lớn → khi lỗi thì chuyển sang <img>.
 */
async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bmp, width: bmp.width, height: bmp.height, release: () => bmp.close() };
    } catch {
      // rơi xuống cách dùng <img>
    }
  }
  return decodeWithImg(file);
}

function canvas2d(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { c, ctx };
}

/**
 * Thu nhỏ giữ nét: giảm một nửa mỗi bước cho tới gần kích thước đích rồi mới vẽ lần cuối.
 * Vẽ thẳng 4000px → 2048px một lần làm trình duyệt bỏ bớt điểm ảnh → răng cưa, mất nét (lỗi cũ).
 */
function resize(source: CanvasImageSource, w: number, h: number, tw: number, th: number): HTMLCanvasElement {
  let cur: CanvasImageSource = source;
  let cw = w;
  let ch = h;
  while (cw / 2 >= tw && ch / 2 >= th) {
    const step = canvas2d(Math.round(cw / 2), Math.round(ch / 2));
    step.ctx.drawImage(cur, 0, 0, step.c.width, step.c.height);
    cur = step.c;
    cw = step.c.width;
    ch = step.c.height;
  }
  const out = canvas2d(tw, th);
  out.ctx.drawImage(cur, 0, 0, tw, th);
  return out.c;
}

/** Co ảnh về tối đa 2048px (giữ nét), xuất WebP (hoặc JPEG) và chỉ hạ chất lượng khi vẫn quá nặng. */
async function compress(file: File): Promise<Blob> {
  const img = await decode(file);
  const k = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const tw = Math.max(1, Math.round(img.width * k));
  const th = Math.max(1, Math.round(img.height * k));
  const canvas = resize(img.source, img.width, img.height, tw, th);
  img.release();
  // Bắt đầu ở chất lượng cao; giới hạn 3MB còn dư nhiều nên hiếm khi phải hạ.
  // Safari không xuất được WebP (trả về PNG) → tự rơi xuống JPEG ở dưới.
  for (const q of [0.9, 0.85, 0.78, 0.7, 0.6]) {
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', q));
    if (blob && blob.type === 'image/webp' && blob.size <= PHOTO_MAX_BYTES) return blob;
    const jpg = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', q));
    if (jpg && jpg.size <= PHOTO_MAX_BYTES) return jpg;
  }
  throw new Error('too_large');
}

async function upload(blob: Blob): Promise<UploadedPhoto> {
  const { key, uploadUrl, publicUrl } = await api<{ key: string; uploadUrl: string; publicUrl: string }>('/api/uploads/presign', {
    method: 'POST',
    json: { contentType: blob.type, size: blob.size },
  });
  const res = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': blob.type }, body: blob });
  if (!res.ok) throw new Error('put_failed');
  return { key, url: publicUrl };
}

const isHeic = (f: File) => /heic|heif/i.test(f.type) || /\.(heic|heif)$/i.test(f.name);

/** Câu báo lỗi theo đúng nguyên nhân (trước đây mọi lỗi đều báo "sai định dạng"). */
function errorMessage(e: unknown, f: File): string {
  if (e instanceof ApiError && e.code === 'rate_limited') return 'Bạn tải ảnh quá nhanh, thử lại sau một chút.';
  const code = e instanceof Error ? e.message : '';
  if (code === 'decode_failed') {
    return isHeic(f)
      ? 'Trình duyệt này chưa đọc được ảnh HEIC của iPhone. Mở trang bằng Safari trên iPhone, hoặc đổi ảnh sang JPG rồi thử lại.'
      : 'Không đọc được ảnh này. Thử chọn ảnh khác (JPG, PNG, HEIC hoặc WebP).';
  }
  if (code === 'too_large') return 'Ảnh quá nặng sau khi nén. Thử chọn ảnh khác.';
  return 'Không tải được một ảnh. Kiểm tra kết nối mạng rồi thử lại.';
}

/**
 * Chọn ảnh → nén ở trình duyệt → tải thẳng lên R2 → trả về danh sách khoá.
 * Ảnh đầu tiên là ảnh bìa.
 */
export function PhotoUploader({ value, onChange }: { value: UploadedPhoto[]; onChange: (next: UploadedPhoto[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const room = MAX_PHOTOS - value.length;

  async function pick(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const list = Array.from(files).slice(0, room);
    setBusy((n) => n + list.length);
    const done: UploadedPhoto[] = [];
    for (const f of list) {
      try {
        done.push(await upload(await compress(f)));
      } catch (e) {
        setError(errorMessage(e, f));
      } finally {
        setBusy((n) => n - 1);
      }
    }
    if (done.length) onChange([...value, ...done]);
    if (input.current) input.current.value = '';
  }

  const makeCover = (i: number) => onChange([value[i], ...value.filter((_, j) => j !== i)]);
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

  return (
    <div className={s.root}>
      <ul className={s.grid}>
        {value.map((p, i) => (
          <li key={p.key} className={s.item}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) */}
            <img src={p.url} alt={i === 0 ? 'Ảnh bìa' : `Ảnh ${i + 1}`} />
            {i === 0 ? <span className={s.badge}>Ảnh bìa</span> : null}
            <span className={s.actions}>
              {i > 0 ? <button type="button" onClick={() => makeCover(i)}>Đặt làm bìa</button> : null}
              <button type="button" onClick={() => remove(i)} aria-label="Xoá ảnh"><Icon name="trash" size={14} /></button>
            </span>
          </li>
        ))}
        {Array.from({ length: busy }).map((_, i) => (
          <li key={`busy-${i}`} className={`${s.item} ${s.loading}`} aria-busy="true">Đang tải…</li>
        ))}
        {room - busy > 0 ? (
          <li className={s.item}>
            <button type="button" className={s.add} onClick={() => input.current?.click()}>
              <Icon name="camera" size={22} />
              <span>Thêm ảnh</span>
            </button>
          </li>
        ) : null}
      </ul>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e.target.files)} />
      <p className={s.hint}>Tối đa {MAX_PHOTOS} ảnh, nhận cả ảnh chụp từ iPhone. Ảnh được nén tự động trước khi tải lên.</p>
      {error ? <p role="alert" className={s.error}>{error}</p> : null}
    </div>
  );
}
