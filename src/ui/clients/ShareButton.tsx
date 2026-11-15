'use client';

import { Button, type ButtonVariant } from '../primitives/Button';
import { Icon } from '../primitives/Icon';

type Props = { url: string; title?: string; text?: string; label?: string; variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg'; block?: boolean };

/** Mở share sheet của hệ điều hành (Zalo, Messenger…); không có thì sao chép link. */
export function ShareButton({ url, title, text, label = 'Gửi Zalo / Messenger', variant = 'primary', size = 'md', block }: Props) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      block={block}
      leading={<Icon name="share" size={16} />}
      onClick={async () => {
        if (typeof navigator.share === 'function') {
          await navigator.share({ url, title, text }).catch(() => {});
        } else {
          await navigator.clipboard?.writeText(url).catch(() => {});
          alert('Đã chép link. Dán vào Zalo hoặc Messenger để gửi.');
        }
      }}
    >
      {label}
    </Button>
  );
}
