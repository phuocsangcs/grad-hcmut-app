import { customAlphabet } from 'nanoid';

/** Bỏ 0 o 1 l i để đọc miệng không nhầm. */
export const INVITE_CODE_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
export const INVITE_CODE_LENGTH = 6;
export const INVITE_CODE_RE = new RegExp(`^[${INVITE_CODE_ALPHABET}]{${INVITE_CODE_LENGTH}}$`);

export const newInviteCode = customAlphabet(INVITE_CODE_ALPHABET, INVITE_CODE_LENGTH);

export function isInviteCode(s: string): boolean {
  return INVITE_CODE_RE.test(s);
}

/** Sinh n code không trùng nhau và không trùng với tập đã có. */
export function generateUniqueCodes(n: number, existing: Set<string> = new Set()): string[] {
  const out: string[] = [];
  const seen = new Set(existing);
  while (out.length < n) {
    const c = newInviteCode();
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out;
}
