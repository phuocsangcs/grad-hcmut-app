import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cx } from '../cx';
import s from './Field.module.css';

type Wrap = { label: ReactNode; hint?: ReactNode; error?: ReactNode; optional?: boolean; className?: string; children: ReactNode; htmlFor?: string };

/** Nhãn + ô nhập + gợi ý/lỗi. Dùng cho mọi form để đồng nhất. */
export function Field({ label, hint, error, optional, className, children, htmlFor }: Wrap) {
  return (
    <label className={cx(s.field, className)} htmlFor={htmlFor}>
      <span className={s.label}>
        {label}
        {optional ? <small className={s.optional}>tuỳ chọn</small> : null}
      </span>
      {children}
      {error ? (
        <span className={s.error} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className={s.hint}>{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(s.control, className)} {...rest} />;
}
export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(s.control, s.textarea, className)} {...rest} />;
}
export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={s.selectWrap}>
      <select className={cx(s.control, s.select, className)} {...rest}>
        {children}
      </select>
    </span>
  );
}
