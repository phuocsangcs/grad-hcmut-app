'use client';

import { useState } from 'react';
import { Button, type ButtonVariant } from '../primitives/Button';
import { Icon } from '../primitives/Icon';

type Props = { text: string; label?: string; doneLabel?: string; variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg'; block?: boolean; className?: string };

/** Nút sao chép có phản hồi "Đã chép" trong 1.6s. */
export function CopyButton({ text, label = 'Sao chép', doneLabel = 'Đã chép', variant = 'secondary', size = 'md', block, className }: Props) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      block={block}
      className={className}
      leading={<Icon name={done ? 'check' : 'copy'} size={16} />}
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { return; }
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? doneLabel : label}
    </Button>
  );
}
