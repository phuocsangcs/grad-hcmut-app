import { initials } from './date';

/**
 * Ảnh chân dung người tạo thiệp; chưa có ảnh thì hiện chữ cái đầu trên nền màu khoa.
 * Khung (bo tròn, lục giác, polaroid…) do mẫu quyết định qua className.
 */
export function Portrait({ src, name, className, priority }: { src: string | null; name: string; className?: string; priority?: boolean }) {
  return (
    <div className={className} data-portrait={src ? 'photo' : 'initials'}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh ngoài (R2) hoặc ảnh mẫu, đã nén
        <img
          src={src}
          alt={`Ảnh của ${name}`}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%', display: 'block' }}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            fontSize: 'clamp(1.6rem, 30cqmin, 3rem)',
            letterSpacing: '0.04em',
            color: '#fff',
            background: 'linear-gradient(160deg, var(--bk-500), var(--t-accent, var(--bk-700)))',
          }}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}
