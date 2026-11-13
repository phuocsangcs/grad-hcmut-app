/** Slug trùng với route hệ thống → cấm. */
export const RESERVED_SLUGS = new Set([
  'create', 'manage', 'guide', 'eat', 'privacy', 'about', 'api', 'admin',
  '_next', 'static', 'public', 'favicon.ico', 'robots.txt', 'sitemap.xml',
  'login', 'logout', 'signup', 'help', 'terms', 'contact', 'images', 'assets',
]);

export const SLUG_MIN = 3;
export const SLUG_MAX = 40;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Bỏ dấu tiếng Việt, đổi đ→d, chỉ giữ a-z0-9 và gạch ngang. */
export function normalizeSlug(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX);
}

export type SlugProblem = 'invalid' | 'reserved';

export function validateSlug(slug: string): SlugProblem | null {
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX || !SLUG_RE.test(slug)) return 'invalid';
  if (RESERVED_SLUGS.has(slug)) return 'reserved';
  return null;
}

/**
 * Gợi ý khi trùng: thêm hậu tố khoa, năm, số.
 * Trả về danh sách ứng viên theo thứ tự ưu tiên, chưa kiểm tra DB.
 */
export function suggestSlugs(base: string, opts: { facultyId?: string; year?: number } = {}): string[] {
  const b = normalizeSlug(base) || 'thiep';
  const year = opts.year ?? new Date().getFullYear();
  const cands = [
    opts.facultyId ? `${b}-${opts.facultyId}` : null,
    `${b}-${year}`,
    `${b}-k${String(year - 4).slice(-2)}`,
    `${b}-2`, `${b}-3`,
  ].filter((s): s is string => !!s);
  return [...new Set(cands)].filter((s) => validateSlug(s) === null);
}
