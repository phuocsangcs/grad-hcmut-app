import { describe, expect, it } from 'vitest';
import { generateManageToken, hashToken, safeEqualHex, tokenLooksValid } from './token';

describe('manage token', () => {
  it('sinh token hợp lệ, hash ổn định', () => {
    const t = generateManageToken();
    expect(tokenLooksValid(t)).toBe(true);
    expect(hashToken(t)).toBe(hashToken(t));
    expect(hashToken(t)).not.toBe(hashToken(generateManageToken()));
  });
  it('safeEqualHex', () => {
    const h = hashToken('a');
    expect(safeEqualHex(h, h)).toBe(true);
    expect(safeEqualHex(h, hashToken('b'))).toBe(false);
    expect(safeEqualHex(h, 'ab')).toBe(false);
  });
});
