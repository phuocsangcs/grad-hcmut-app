'use client';

import { useEffect } from 'react';
import { useGate } from '../shared/Gate';

/** Phím Enter trên bàn phím cũng mở thiệp (đúng tinh thần dòng lệnh). */
export function EnterKey() {
  const { phase, open } = useGate();
  useEffect(() => {
    if (phase !== 'closed') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !(e.target as HTMLElement).closest('input,textarea,button,a')) open();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, open]);
  return null;
}
