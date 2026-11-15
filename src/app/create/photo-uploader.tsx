'use client';

import { useRef, useState } from 'react';
import { api, ApiError } from '@/components/api';
import { MAX_PHOTOS, PHOTO_MAX_BYTES } from '@/lib/storage-keys';
import { Icon } from '@/ui';
import s from './photo-uploader.module.css';

export type UploadedPhoto = { key: string; url: string };

const MAX_SIDE = 1600;

/** Co ảnh về tối đa 1600px, xuất WebP (hoặc JPEG) và hạ chất lượng dần nếu vẫn quá nặng. */
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  for (const q of [0.82, 0.7, 0.55]) {
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
        setError(
          e instanceof ApiError && e.code === 'rate_limited'
            ? 'Bạn tải ảnh quá nhanh, thử lại sau một chút.'
            : 'Không tải được một ảnh. Dùng ảnh JPG, PNG hoặc WebP rồi thử lại.',
        );
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
      <p className={s.hint}>Tối đa {MAX_PHOTOS} ảnh. Ảnh được nén tự động trước khi tải lên.</p>
      {error ? <p role="alert" className={s.error}>{error}</p> : null}
    </div>
  );
}
