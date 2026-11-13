import { vi, type Dictionary } from './vi';

export type Locale = 'vi';

const dictionaries: Record<Locale, Dictionary> = { vi };

/** MVP chỉ có tiếng Việt. Sau này đọc locale từ cookie/URL. */
export function t(locale: Locale = 'vi'): Dictionary {
  return dictionaries[locale];
}

export { vi };
