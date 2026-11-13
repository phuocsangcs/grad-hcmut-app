import { beforeEach, describe, expect, it } from 'vitest';
import { createCard, getPublicCard } from '@/modules/card';
import { setEmailAdapterForTests, type EmailMessage } from '@/lib/email';
import { deleteByToken, getOverview, requireCardByToken, sendRecoveryEmail, updateByToken } from './manage.service';
import { hashToken } from './token';

const mk = (slug: string, ownerEmail?: string) =>
  createCard({ displayName: 'Sang', facultyId: 'cse', templateId: 'classic', message: '', greetings: {}, slug, ownerEmail });

describe('manage.service', () => {
  const sent: EmailMessage[] = [];
  beforeEach(() => {
    sent.length = 0;
    setEmailAdapterForTests({ send: async (m) => void sent.push(m) });
  });

  it('token đúng → overview; token sai/định dạng lạ → 404', async () => {
    const { card, manageToken } = await mk('mng-a');
    const o = await getOverview(manageToken);
    expect(o.card.id).toBe(card.id);
    expect(o.urls.card).toBe('http://localhost:3000/mng-a');
    expect(o.summary).toEqual({ responses: 0, guests: 0, wishes: 0 });
    await expect(requireCardByToken('x')).rejects.toMatchObject({ status: 404 });
    await expect(requireCardByToken('A'.repeat(43))).rejects.toMatchObject({ status: 404 });
  });

  it('sửa và xoá qua token', async () => {
    const { manageToken } = await mk('mng-b');
    const u = await updateByToken(manageToken, { templateId: 'minimal', message: 'Mới' });
    expect(u.templateId).toBe('minimal');
    expect(u.message).toBe('Mới');
    await deleteByToken(manageToken);
    expect(await getPublicCard('mng-b')).toEqual({ status: 'not_found' });
    await expect(getOverview(manageToken)).rejects.toMatchObject({ status: 404 });
  });

  it('khôi phục qua email: sinh token mới, token cũ hết hiệu lực, email lạ không gửi gì', async () => {
    const { card, manageToken } = await mk('mng-c', 'owner@example.com');
    const r = await sendRecoveryEmail('owner@example.com');
    expect(r.sent).toBe(1);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('owner@example.com');
    const m = sent[0].text.match(/manage\/([A-Za-z0-9_-]{40,50})/);
    expect(m).not.toBeNull();
    const newToken = m![1];
    expect((await requireCardByToken(newToken)).id).toBe(card.id);
    await expect(requireCardByToken(manageToken)).rejects.toMatchObject({ status: 404 });
    expect(hashToken(newToken)).not.toBe(hashToken(manageToken));

    expect(await sendRecoveryEmail('stranger@example.com')).toEqual({ sent: 0 });
    expect(sent).toHaveLength(1);
  });
});
