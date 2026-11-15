'use client';

import { useEffect, useRef, useState } from 'react';
import s from './extras.module.css';

type Props = { src: string; title: string; artist?: string; preview?: boolean };

/**
 * Nhạc nền của thiệp. Trình duyệt chặn tự phát, nên nút hiện "Bật nhạc" và
 * lần chạm đầu tiên vào thiệp sẽ bắt đầu phát (trừ khi khách đã tự tắt).
 */
export function MusicPlayer({ src, title, artist, preview }: Props) {
  const audio = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);
  const userStopped = useRef(false);

  useEffect(() => {
    if (preview) return;
    const start = () => {
      if (userStopped.current) return;
      audio.current?.play().then(() => setOn(true)).catch(() => {});
    };
    window.addEventListener('pointerdown', start, { once: true });
    return () => window.removeEventListener('pointerdown', start);
  }, [preview]);

  function toggle() {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      userStopped.current = false;
      a.play().then(() => setOn(true)).catch(() => {});
    } else {
      userStopped.current = true;
      a.pause();
      setOn(false);
    }
  }

  return (
    <>
      <audio ref={audio} src={src} loop preload="none" />
      <button type="button" className={s.music} data-on={on} onClick={toggle} aria-pressed={on} aria-label={on ? 'Tắt nhạc nền' : 'Bật nhạc nền'}>
        <span className={s.note} aria-hidden="true">♪</span>
        <span className={s.title}>{on ? (artist ? `${title} · ${artist}` : title) : 'Bật nhạc'}</span>
      </button>
    </>
  );
}
