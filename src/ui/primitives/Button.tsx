import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx';
import s from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'white' | 'danger';
export type ButtonSize = 'md' | 'lg' | 'sm';

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Chiếm hết chiều ngang (hay dùng trên điện thoại). */
  block?: boolean;
  /** Icon đặt sau chữ. */
  trailing?: ReactNode;
  leading?: ReactNode;
  className?: string;
  children: ReactNode;
};

type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & { href: string; target?: string; rel?: string; download?: boolean | string; 'aria-label'?: string };

export type ButtonProps = AsButton | AsLink;

/**
 * Nút duy nhất của hệ thống. Có href → render <a>/<Link>, không thì <button>.
 * Vùng chạm tối thiểu 44px, viền pill theo token (phẳng thì tự vuông).
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', block, trailing, leading, className, children } = props;
  const cls = cx(s.btn, s[variant], s[size], block && s.block, className);
  const inner = (
    <>
      {leading ? <span className={s.icon}>{leading}</span> : null}
      <span>{children}</span>
      {trailing ? <span className={s.icon}>{trailing}</span> : null}
    </>
  );

  if ('href' in props && props.href !== undefined) {
    const { href, target, rel, download, 'aria-label': ariaLabel } = props;
    const external = /^(https?:|mailto:|tel:)/.test(href) || target === '_blank' || download !== undefined;
    if (external) {
      return (
        <a href={href} target={target} rel={rel ?? (target === '_blank' ? 'noreferrer' : undefined)} download={download} aria-label={ariaLabel} className={cls}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- tách prop riêng của component khỏi thuộc tính DOM
  const { variant: _v, size: _s, block: _b, trailing: _t, leading: _l, className: _c, children: _ch, ...rest } = props as AsButton;
  return (
    <button type="button" {...rest} className={cls}>
      {inner}
    </button>
  );
}
