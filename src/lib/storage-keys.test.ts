import { describe, expect, it } from 'vitest';
import { createCardSchema } from '@/modules/card/card.validators';
import { CARD_KEY_RE, MAX_PHOTOS, PENDING_KEY_RE, isPhotoType } from './storage-keys';

const id = 'a'.repeat(21);

describe('storage-keys', () => {
  it('chỉ nhận khoá pending/ đúng dạng, chặn đường dẫn lạ', () => {
    expect(PENDING_KEY_RE.test(`pending/${id}.webp`)).toBe(true);
    expect(PENDING_KEY_RE.test(`pending/${id}.gif`)).toBe(false);
    expect(PENDING_KEY_RE.test(`pending/../cards/x/${id}.jpg`)).toBe(false);
    expect(PENDING_KEY_RE.test(`cards/abcdefgh1234/${id}.jpg`)).toBe(false);
    expect(PENDING_KEY_RE.test('pending/short.jpg')).toBe(false);
  });

  it('chỉ cho xoá khoá nằm trong cards/<id>/', () => {
    expect(CARD_KEY_RE.test(`cards/abcdefgh1234/${id}.jpg`)).toBe(true);
    expect(CARD_KEY_RE.test(`pending/${id}.jpg`)).toBe(false);
    expect(CARD_KEY_RE.test(`cards/../${id}.jpg`)).toBe(false);
  });

  it('nhận jpeg/webp/png, từ chối loại khác', () => {
    expect(isPhotoType('image/webp')).toBe(true);
    expect(isPhotoType('image/svg+xml')).toBe(false);
    expect(isPhotoType('toString')).toBe(false);
  });

  it('createCardSchema: photos tối đa MAX_PHOTOS và đúng dạng khoá', () => {
    const base = { displayName: 'A', facultyId: 'cse', templateId: 'print', slug: 'abc-def' };
    const key = `pending/${id}.jpg`;
    expect(createCardSchema.parse({ ...base, photos: [key] }).photos).toEqual([key]);
    expect(() => createCardSchema.parse({ ...base, photos: Array(MAX_PHOTOS + 1).fill(key) })).toThrow();
    expect(() => createCardSchema.parse({ ...base, photos: ['https://evil.example/x.jpg'] })).toThrow();
  });
});
