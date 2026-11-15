import s from './gallery.module.css';

/** Ảnh của người tạo thiệp: ảnh đầu là ảnh bìa (to), các ảnh còn lại là lưới nhỏ. */
export function Gallery({ photos, name }: { photos: string[]; name: string }) {
  if (photos.length === 0) return null;
  const [cover, ...rest] = photos;
  return (
    <figure className={s.gallery}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2), đã nén ở trình duyệt */}
      <img src={cover} alt={`Ảnh của ${name}`} className={s.cover} loading="lazy" decoding="async" />
      {rest.length > 0 ? (
        <div className={s.grid}>
          {rest.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- như trên
            <img key={src} src={src} alt={`Ảnh ${i + 2} của ${name}`} loading="lazy" decoding="async" />
          ))}
        </div>
      ) : null}
    </figure>
  );
}
