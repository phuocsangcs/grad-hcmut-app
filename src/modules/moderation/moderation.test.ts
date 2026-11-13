import { beforeEach, describe, expect, it } from 'vitest';
import { createCard, getPublicCard, cardRepo } from '@/modules/card';
import { setEmailAdapterForTests, type EmailMessage } from '@/lib/email';
import { vnDate } from '@/lib/time';
import { MemoryRateLimiter, clientIp } from './rate-limit';
import { verifyTurnstile } from './turnstile';
import { AUTO_LOCK_THRESHOLD, cleanupExpiredCards, hashIp, listReports, submitReport } from './report.service';

const mk = (slug: string) =>
  createCard({ displayName: 'Sang', facultyId: 'cse', templateId: 'classic', message: '', greetings: {}, slug });

describe('rate limit', () => {
  it('đếm theo cửa sổ và reset', () => {
    const rl = new MemoryRateLimiter();
    const rule = { limit: 2, windowMs: 1000 };
    expect(rl.hit('a', rule, 0).allowed).toBe(true);
    expect(rl.hit('a', rule, 10).allowed).toBe(true);
    expect(rl.hit('a', rule, 20)).toMatchObject({ allowed: false, remaining: 0 });
    expect(rl.hit('b', rule, 20).allowed).toBe(true);
    expect(rl.hit('a', rule, 1001).allowed).toBe(true);
  });
  it('clientIp từ header', () => {
    expect(clientIp(new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } }))).toBe('1.2.3.4');
    expect(clientIp(new Request('http://x'))).toBe('unknown');
  });
});

describe('turnstile', () => {
  it('không cấu hình secret → luôn hợp lệ', async () => {
    expect(await verifyTurnstile(undefined)).toBe(true);
  });
});

describe('report', () => {
  const sent: EmailMessage[] = [];
  beforeEach(() => {
    sent.length = 0;
    process.env.ADMIN_EMAIL = 'admin@example.com';
    setEmailAdapterForTests({ send: async (m) => void sent.push(m) });
  });

  it('lưu report, hash IP, tự khoá khi đủ IP khác nhau', async () => {
    const { card } = await mk('rep-a');
    const r1 = await submitReport('rep-a', { reason: 'spam' }, '1.1.1.1');
    expect(r1.autoLocked).toBe(false);
    // cùng IP báo nhiều lần không tính thêm
    await submitReport('rep-a', { reason: 'spam' }, '1.1.1.1');
    await submitReport('rep-a', { reason: 'offensive', detail: 'xxx' }, '2.2.2.2');
    expect((await getPublicCard('rep-a')).status).toBe('ok');

    const r4 = await submitReport('rep-a', { reason: 'other' }, '3.3.3.3');
    expect(r4.autoLocked).toBe(true);
    expect((await getPublicCard('rep-a')).status).toBe('locked');
    expect(sent).toHaveLength(4);
    expect(sent[3].to).toBe('admin@example.com');
    expect(sent[3].subject).toContain('ĐÃ TỰ KHOÁ');

    const list = await listReports(card.id);
    expect(list).toHaveLength(4);
    expect(list[0].reporterIpHash).toBe(hashIp('1.1.1.1'));
    expect(list[0].reporterIpHash).not.toContain('1.1.1.1');
    expect(AUTO_LOCK_THRESHOLD).toBe(3);
  });

  it('thiệp không tồn tại → 404', async () => {
    await expect(submitReport('nope', { reason: 'spam' }, '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('xoá thiệp hết hạn, giữ thiệp còn hạn', async () => {
    const { card: old } = await mk('old-one');
    await cardRepo.update(old.id, { expiresAt: vnDate('2026-01-01') });
    await mk('fresh-one');
    const n = await cleanupExpiredCards(vnDate('2026-06-01'));
    expect(n).toBe(1);
    expect((await getPublicCard('old-one')).status).toBe('not_found');
    expect((await getPublicCard('fresh-one')).status).toBe('ok');
  });
});
