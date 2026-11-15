import type { CSSProperties } from 'react';
import type { Faculty } from '@/modules/content';

/** CSS variable của khoa, gắn vào root của template. */
export function facultyVars(f: Faculty): CSSProperties {
  return { '--t-accent': f.accent, '--t-soft': f.soft, '--m-accent': f.accent } as CSSProperties;
}
