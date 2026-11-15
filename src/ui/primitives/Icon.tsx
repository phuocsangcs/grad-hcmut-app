import type { SVGProps } from 'react';

/**
 * Bộ icon nét (stroke) dùng chung, vẽ tay, không phụ thuộc thư viện.
 * Dùng: <Icon name="pin" size={20} />  — màu theo currentColor.
 */
const PATHS = {
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12l5 5 9-10',
  chevron: 'M6 9l6 6 6-6',
  x: 'M6 6l12 12M18 6L6 18',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15',
  calendar: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
  phone: 'M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2',
  fork: 'M4 3v18M4 12h6l1-9M17 3v18M14 3c0 4 6 4 6 0',
  parking: 'M6 20V4h6a4.5 4.5 0 0 1 0 9H6',
  restroom: 'M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 9v12M5 9h6l-1 7M16 9l-3 7h6l-3-7M16 16v5',
  water: 'M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z',
  tree: 'M12 22V12M12 12c-4 0-7-2.5-7-6a7 7 0 0 1 14 0c0 3.5-3 6-7 6z',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  share: 'M4 12v8h16v-8M12 16V3M8 7l4-4 4 4',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
  warning: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  gate: 'M3 21V9l9-6 9 6v12M9 21v-8h6v8',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  users: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21v-2a4 4 0 0 0-3-3.9M15 3.1a4 4 0 0 1 0 7.8',
  heart: 'M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z',
  sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  edit: 'M4 20h4l11-11-4-4L4 16zM13 7l4 4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  external: 'M14 4h6v6M20 4l-9 9M19 14v6H4V5h6',
  download: 'M12 3v12M7 10l5 5 5-5M4 21h16',
  menu: 'M4 7h16M4 12h16M4 17h16',
  hex: 'M12 2l9 5v10l-9 5-9-5V7z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5',
} as const;

export type IconName = keyof typeof PATHS;

type Props = Omit<SVGProps<SVGSVGElement>, 'name'> & { name: IconName; size?: number; title?: string };

export function Icon({ name, size = 20, title, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
