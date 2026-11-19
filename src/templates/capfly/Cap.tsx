/** Mũ cử nhân vẽ phẳng (dùng cho bìa, nút tung, trang trí). */
export function Cap({ className, tassel = 'var(--sun)' }: { className?: string; tassel?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true">
      <path d="M30 40v22c0 8 13.5 14 30 14s30-6 30-14V40L60 52z" fill="#0a1a3d" />
      <path d="M60 8 4 30l56 22 56-22z" fill="#14244f" />
      <path d="M60 8 4 30l56 22 56-22z" fill="none" stroke="#2c3f75" strokeWidth="2" />
      <circle cx="60" cy="30" r="4" fill={tassel} />
      <g data-tassel="">
        <path d="M60 30 96 40v26" stroke={tassel} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M92 64h8l2 14h-12z" fill={tassel} />
      </g>
    </svg>
  );
}
