import { describe, expect, it } from 'vitest';
import { createCard } from './card.service';

const base = { displayName: 'Phước Sang', facultyId: 'cse', templateId: 'print', message: '' };

describe('card.service: ảnh', () => {
  it('chưa cấu hình R2 mà gửi ảnh → 400 storage_disabled, không tạo thiệp', async () => {
    await expect(
      createCard({ ...base, slug: 'co-anh', photos: [`pending/${'b'.repeat(21)}.jpg`] }),
    ).rejects.toMatchObject({ status: 400, code: 'storage_disabled' });
  });

  it('không gửi ảnh thì photos là mảng rỗng', async () => {
    const { card } = await createCard({ ...base, slug: 'khong-anh' });
    expect(card.photos).toEqual([]);
  });
});
