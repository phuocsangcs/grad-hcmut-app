import { describe, expect, it } from 'vitest';
import { checkSlug, createCard, deleteCard, getPublicCard, updateCard } from './card.service';
import { cardRepo } from './card.repo';
import { hashToken } from '@/modules/manage/token';
import { vnDate } from '@/lib/time';

const base = {
  displayName: 'Phước Sang',
  facultyId: 'cse',
  templateId: 'classic',
  message: 'Mời mọi người!',
  greetings: {},
};

describe('card.service', () => {
  it('tạo thiệp: tự điền giờ lễ từ khoa, trả token 1 lần, lưu hash', async () => {
    const { card, manageToken } = await createCard({ ...base, slug: 'Phước Sang K21' });
    expect(card.slug).toBe('phuoc-sang-k21');
    expect(card.ceremonyAt.toISOString()).toBe('2026-11-28T07:30:00.000Z');
    expect(card.venue).toBe('Hội trường A5');
    expect(card.manageTokenHash).toBe(hashToken(manageToken));
    expect(card.expiresAt.getTime() - card.ceremonyAt.getTime()).toBe(30 * 86_400_000);
    expect(await cardRepo.findByTokenHash(hashToken(manageToken))).toMatchObject({ id: card.id });
  });

  it('slug trùng → 409 kèm gợi ý còn trống', async () => {
    await createCard({ ...base, slug: 'sang' });
    await expect(createCard({ ...base, slug: 'sang' })).rejects.toMatchObject({ status: 409, code: 'slug_taken' });
    const chk = await checkSlug('sang', 'cse');
    expect(chk.available).toBe(false);
    if (!chk.available) {
      expect(chk.reason).toBe('taken');
      expect(chk.suggestions[0]).toBe('sang-cse');
    }
    // dùng gợi ý rồi thì không gợi ý lại nữa
    await createCard({ ...base, slug: 'sang-cse' });
    const chk2 = await checkSlug('sang', 'cse');
    if (!chk2.available) expect(chk2.suggestions).not.toContain('sang-cse');
  });

  it('slug cấm / sai → 400', async () => {
    await expect(createCard({ ...base, slug: 'create' })).rejects.toMatchObject({ status: 400, code: 'slug_reserved' });
    await expect(createCard({ ...base, slug: 'ab' })).rejects.toMatchObject({ code: 'slug_invalid' });
    expect(await checkSlug('api')).toMatchObject({ available: false, reason: 'reserved' });
  });

  it('khoa / mẫu / POI không tồn tại → 400', async () => {
    await expect(createCard({ ...base, slug: 'x1-abc', facultyId: 'zzz' })).rejects.toMatchObject({ code: 'faculty_not_found' });
    await expect(createCard({ ...base, slug: 'x2-abc', templateId: 'zzz' })).rejects.toMatchObject({ code: 'template_not_found' });
    await expect(createCard({ ...base, slug: 'x3-abc', meetingPoiId: 'zzz' })).rejects.toMatchObject({ code: 'poi_not_found' });
  });

  it('thiệp công khai: ẩn thông tin nhạy cảm, resolve ?to và ?mode, tăng view', async () => {
    const { card } = await createCard({
      ...base,
      slug: 'public-test',
      greetings: { friends: 'Ê tụi bây,' },
      meetingPoiId: 'bench-a5',
      meetingTime: '16h00',
      phone: '0901234567',
      ownerEmail: 'me@example.com',
    });
    const r = await getPublicCard('public-test', { to: 'friends', now: vnDate('2026-11-20') });
    expect(r.status).toBe('ok');
    if (r.status !== 'ok') return;
    expect(r.card.greeting).toBe('Ê tụi bây,');
    expect(r.card.groupKey).toBe('friends');
    expect(r.card.mode).toBe('before');
    expect(r.card.meeting?.poi.id).toBe('bench-a5');
    expect(r.card.phone).toBe('0901234567');
    expect(JSON.stringify(r.card)).not.toContain('me@example.com');
    expect(JSON.stringify(r.card)).not.toContain(card.manageTokenHash);

    const r2 = await getPublicCard('public-test', { to: 'hack', modeOverride: 'dayof', now: vnDate('2026-11-20') });
    if (r2.status === 'ok') {
      expect(r2.card.groupKey).toBeNull();
      expect(r2.card.greeting).toBe('Gửi bạn,');
      expect(r2.card.mode).toBe('dayof');
    }
    expect((await cardRepo.findById(card.id))?.viewCount).toBe(2);
  });

  it('not_found / expired / locked', async () => {
    expect(await getPublicCard('khong-co')).toEqual({ status: 'not_found' });
    const { card } = await createCard({ ...base, slug: 'old-card' });
    expect(await getPublicCard('old-card', { now: vnDate('2027-01-15') })).toEqual({ status: 'expired' });
    await cardRepo.setLocked(card.id, true);
    expect(await getPublicCard('old-card')).toEqual({ status: 'locked' });
  });

  it('update đổi giờ lễ thì expires_at đổi theo; delete', async () => {
    const { card } = await createCard({ ...base, slug: 'edit-me' });
    const newAt = vnDate('2026-12-05', '09:00');
    const u = await updateCard(card.id, { ceremonyAt: newAt, templateId: 'sunny', phone: '' });
    expect(u.templateId).toBe('sunny');
    expect(u.ceremonyAt.toISOString()).toBe(newAt.toISOString());
    expect(u.expiresAt.getTime()).toBe(newAt.getTime() + 30 * 86_400_000);
    expect(u.phone).toBeNull();
    await deleteCard(card.id);
    expect(await getPublicCard('edit-me')).toEqual({ status: 'not_found' });
    await expect(deleteCard(card.id)).rejects.toMatchObject({ status: 404 });
  });
});
