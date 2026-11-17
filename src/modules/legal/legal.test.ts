import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { consentLogs, contactMessages } from '@/db/schema';
import { setEmailAdapterForTests, type EmailMessage } from '@/lib/email';
import { cardRepo, createCard } from '@/modules/card';
import { limiter } from '@/modules/moderation';
import { POST as createCardRoute } from '@/app/api/cards/route';
import { POST as contactRoute } from '@/app/api/contact/route';
import { TERMS_VERSION } from './terms';
import { cleanupOrphanConsents, getConsentForCard, recordConsent } from './consent.service';
import { cleanupOldContactMessages, listContactMessages, markContactRead, submitContact } from './contact.service';
import { adminSessionValue, checkAdminPassword, isAdminSession } from './admin-auth';

const body = (slug: string, extra: Record<string, unknown> = {}) => ({
  displayName: 'Sang',
  facultyId: 'cse',
  templateId: 'print',
  message: '',
  slug,
  ...extra,
});
const post = (handler: (r: Request) => Promise<Response>, json: unknown, ua = 'Vitest/1.0') =>
  handler(
    new Request('http://localhost/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '9.9.9.9', 'user-agent': ua },
      body: JSON.stringify(json),
    }),
  );

beforeEach(() => limiter.clear());

describe('đồng ý điều khoản khi tạo thiệp', () => {
  it('không tích đồng ý → 400, không tạo thiệp', async () => {
    const res = await post(createCardRoute, body('chua-dong-y'));
    expect(res.status).toBe(400);
    expect(await cardRepo.slugExists('chua-dong-y')).toBe(false);
  });

  it('phiên bản điều khoản cũ → terms_outdated', async () => {
    const res = await post(createCardRoute, body('ban-cu', { acceptTerms: true, termsVersion: '2000-01-01' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('terms_outdated');
    expect(await cardRepo.slugExists('ban-cu')).toBe(false);
  });

  it('đồng ý → tạo thiệp và ghi log gắn với thiệp (IP băm, không lưu IP thô)', async () => {
    const res = await post(createCardRoute, body('da-dong-y', { acceptTerms: true, termsVersion: TERMS_VERSION }));
    expect(res.status).toBe(201);
    const card = await cardRepo.findBySlug('da-dong-y');
    const log = await getConsentForCard(card!.id);
    expect(log).toMatchObject({ termsVersion: TERMS_VERSION, userAgent: 'Vitest/1.0' });
    expect(log!.ipHash).toMatch(/^[0-9a-f]{32}$/);
    expect(log!.ipHash).not.toContain('9.9.9.9');
  });

  it('xoá thiệp → log còn nhưng mất liên kết; cron chỉ xoá log mồ côi quá 12 tháng', async () => {
    const { card } = await createCard(body('se-xoa'));
    const log = await recordConsent(card.id, TERMS_VERSION, { ip: '1.1.1.1', userAgent: null });
    await cardRepo.delete(card.id);
    const [kept] = await db.select().from(consentLogs).where(eq(consentLogs.id, log.id));
    expect(kept.cardId).toBeNull();

    expect(await cleanupOrphanConsents(new Date(Date.now() + 30 * 86_400_000))).toBe(0);
    expect(await cleanupOrphanConsents(new Date(Date.now() + 400 * 86_400_000))).toBeGreaterThanOrEqual(1);
    expect(await db.select().from(consentLogs).where(eq(consentLogs.id, log.id))).toHaveLength(0);
  });

  it('thiệp tạo trước khi có tính năng → không có log', async () => {
    const { card } = await createCard(body('thiep-cu'));
    expect(await getConsentForCard(card.id)).toBeNull();
  });
});

describe('liên hệ', () => {
  const sent: EmailMessage[] = [];
  beforeEach(() => {
    sent.length = 0;
    setEmailAdapterForTests({ send: async (m) => void sent.push(m) });
  });
  afterEach(() => setEmailAdapterForTests(undefined));

  it('lưu tin nhắn và báo về ADMIN_EMAIL, email chủ dự án không lộ ra response', async () => {
    const res = await post(contactRoute, { topic: 'bug', name: 'Lan', replyTo: 'zalo 0901', message: 'Nút xuất bản không bấm được trên iPad.' });
    expect(res.status).toBe(201);
    expect(JSON.stringify(await res.json())).not.toContain('admin@example.com');
    const [m] = await listContactMessages();
    expect(m).toMatchObject({ topic: 'bug', name: 'Lan', replyTo: 'zalo 0901', readAt: null });
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('admin@example.com');
    expect(sent[0].text).toContain('zalo 0901');
  });

  it('ô bẫy có chữ (bot) → trả thành công nhưng không lưu, không gửi email', async () => {
    const before = (await listContactMessages()).length;
    const res = await post(contactRoute, { topic: 'other', message: 'mua thuốc giá rẻ tại đây nhé', website: 'http://spam' });
    expect(res.status).toBe(201);
    expect(await listContactMessages()).toHaveLength(before);
    expect(sent).toHaveLength(0);
  });

  it('nội dung quá ngắn / chủ đề lạ → 400', async () => {
    expect((await post(contactRoute, { topic: 'bug', message: 'hi' })).status).toBe(400);
    expect((await post(contactRoute, { topic: 'hack', message: 'nội dung đủ dài rồi đó' })).status).toBe(400);
  });

  it('giới hạn số lần gửi theo IP', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await post(contactRoute, { topic: 'feedback', message: `góp ý số ${i} cho dự án` })).status);
    expect(statuses.slice(0, 5).every((s) => s === 201)).toBe(true);
    expect(statuses[5]).toBe(429);
  });

  it('email lỗi vẫn lưu được tin nhắn', async () => {
    setEmailAdapterForTests({ send: async () => { throw new Error('resend down'); } });
    const { id } = await submitContact({ topic: 'feedback', message: 'email hỏng vẫn phải lưu' }, '2.2.2.2');
    expect((await listContactMessages()).some((m) => m.id === id)).toBe(true);
  });

  it('đánh dấu đã đọc và dọn tin quá 180 ngày', async () => {
    const { id } = await submitContact({ topic: 'other', message: 'tin để đánh dấu đã đọc' }, '3.3.3.3');
    await markContactRead(id!, true);
    expect((await db.select().from(contactMessages).where(eq(contactMessages.id, id!)))[0].readAt).not.toBeNull();
    expect(await cleanupOldContactMessages(new Date(Date.now() + 200 * 86_400_000))).toBeGreaterThanOrEqual(1);
    expect(await listContactMessages()).toHaveLength(0);
  });
});

describe('đăng nhập quản trị', () => {
  it('đúng/sai mật khẩu', () => {
    expect(checkAdminPassword('test-admin-token-1234567890')).toBe(true);
    expect(checkAdminPassword('sai')).toBe(false);
    expect(checkAdminPassword('')).toBe(false);
  });
  it('cookie phiên là HMAC, không chứa mật khẩu', () => {
    const v = adminSessionValue()!;
    expect(v).not.toContain('test-admin-token');
    expect(isAdminSession(v)).toBe(true);
    expect(isAdminSession(undefined)).toBe(false);
    expect(isAdminSession(v.replace(/.$/, (c) => (c === 'a' ? 'b' : 'a')))).toBe(false);
  });
});
