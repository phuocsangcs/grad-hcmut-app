'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/ui';
import s from './feed.module.css';

/** Ảnh vuốt ngang kiểu bài đăng nhiều ảnh: chấm chỉ vị trí + nhãn 1/3. */
export function FeedCarousel({ photos, name, children }: { photos: string[]; name: string; children?: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  const go = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  if (photos.length === 0) return <div className={s.media}>{children}</div>;

  return (
    <div className={s.media}>
      <div ref={track} className={s.track} onScroll={onScroll}>
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu, đã nén
          <img key={src} src={src} alt={i === 0 ? `Ảnh của ${name}` : `Ảnh ${i + 1} của ${name}`} decoding="async" loading={i === 0 ? 'eager' : 'lazy'} />
        ))}
      </div>
      {photos.length > 1 ? (
        <>
          <span className={s.counter}>
            {index + 1}/{photos.length}
          </span>
          <div className={s.dots} role="tablist" aria-label="Chọn ảnh">
            {photos.map((src, i) => (
              <button key={src} type="button" role="tab" aria-selected={i === index} aria-label={`Ảnh ${i + 1}`} onClick={() => go(i)} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Thả tim chúc mừng: chỉ là hiệu ứng trên máy người xem, không lưu đi đâu. */
export function FeedLike({ name }: { name: string }) {
  const [liked, setLiked] = useState(false);
  return (
    <>
      <button type="button" className={s.iconBtn} data-liked={liked ? '' : undefined} aria-pressed={liked} aria-label={liked ? 'Bỏ tim' : 'Thả tim chúc mừng'} onClick={() => setLiked((v) => !v)}>
        <Icon name="heart" size={26} />
      </button>
      <p className={s.likes} aria-live="polite">
        {liked ? (
          <>
            Bạn đã thả tim chúc mừng <b>{name}</b>
          </>
        ) : (
          'Thả tim để chúc mừng tân cử nhân'
        )}
      </p>
    </>
  );
}
