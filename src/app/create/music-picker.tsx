'use client';

import { useEffect, useRef, useState } from 'react';
import s from './music-picker.module.css';

export type MusicOption = { id: string; title: string; artist?: string; src: string };

type Props = {
  options: MusicOption[];
  value: string;
  onChange: (id: string) => void;
  /** Có dòng "Không dùng nhạc" (trang quản lý). Form tạo thiệp tắt nhạc bằng công tắc nên không cần. */
  allowNone?: boolean;
  name?: string;
};

/**
 * Chọn nhạc nền kèm nghe thử: mỗi bài một dòng, nút ▶ phát thử ngay trong form.
 * Chỉ một bài phát cùng lúc; rời khỏi form (unmount) thì tự dừng.
 */
export function MusicPicker({ options, value, onChange, allowNone, name = 'music' }: Props) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audio.current?.pause();
      audio.current = null;
    };
  }, []);

  function stop() {
    audio.current?.pause();
    setPlaying(null);
    setLoading(null);
  }

  function toggle(o: MusicOption) {
    if (playing === o.id || loading === o.id) return stop();
    audio.current?.pause();
    const a = new Audio(o.src);
    a.preload = 'auto';
    a.onended = () => setPlaying((cur) => (cur === o.id ? null : cur));
    audio.current = a;
    setFailed(null);
    setLoading(o.id);
    setPlaying(null);
    a.play()
      .then(() => {
        if (audio.current !== a) return a.pause(); // người dùng đã bấm bài khác trong lúc tải
        setLoading(null);
        setPlaying(o.id);
      })
      .catch(() => {
        if (audio.current !== a) return;
        setLoading(null);
        setFailed(o.id);
      });
  }

  return (
    <div className={s.list} role="radiogroup" aria-label="Chọn nhạc nền">
      {allowNone ? (
        <label className={s.row} data-selected={value === '' ? '' : undefined}>
          <span className={s.play} aria-hidden="true" data-empty="">×</span>
          <span className={s.text}>
            <b>Không dùng nhạc</b>
          </span>
          <input
            type="radio"
            name={name}
            checked={value === ''}
            onChange={() => {
              stop();
              onChange('');
            }}
          />
        </label>
      ) : null}
      {options.map((o) => {
        const isPlaying = playing === o.id;
        const isLoading = loading === o.id;
        return (
          <label key={o.id} className={s.row} data-selected={value === o.id ? '' : undefined}>
            <button
              type="button"
              className={s.play}
              data-playing={isPlaying ? '' : undefined}
              aria-label={isPlaying || isLoading ? `Dừng nghe thử ${o.title}` : `Nghe thử ${o.title}`}
              onClick={(e) => {
                // Nút nằm trong label: chặn để bấm nghe thử không đồng thời chọn bài.
                e.preventDefault();
                toggle(o);
              }}
            >
              {isLoading ? <span className={s.spinner} /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <span className={s.text}>
              <b>{o.title}</b>
              <small>{failed === o.id ? 'Không phát được, thử lại sau.' : isPlaying ? 'Đang nghe thử…' : o.artist ?? ''}</small>
            </span>
            {isPlaying ? (
              <span className={s.bars} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            ) : null}
            <input type="radio" name={name} checked={value === o.id} onChange={() => onChange(o.id)} aria-label={`Chọn ${o.title}`} />
          </label>
        );
      })}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
    </svg>
  );
}
