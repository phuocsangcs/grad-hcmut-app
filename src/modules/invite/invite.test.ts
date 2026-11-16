import { describe, expect, it } from 'vitest';
import { createCard } from '@/modules/card';
import { submitRsvp } from '@/modules/rsvp';
import { generateUniqueCodes, isInviteCode } from './code';
import { parseBulkText } from './bulk-parser';
import { bulkCreateInvites, exportInvitesCsv, getPublicCardByInvite, inviteStats, listInvites, removeInvite, updateInvite } from './invite.service';

const T = new Set(['print', 'glass', 'ticket', 'royal']);
const mk = (slug: string) =>
  createCard({ displayName: 'Sang', facultyId: 'cse', templateId: 'print', message: '', slug });

describe('invite code', () => {
  it('6 ký tự, không trùng, không ký tự dễ nhầm', () => {
    const codes = generateUniqueCodes(500);
    expect(new Set(codes).size).toBe(500);
    for (const c of codes) {
      expect(isInviteCode(c)).toBe(true);
      expect(c).not.toMatch(/[0o1li]/);
    }
    expect(isInviteCode('abc')).toBe(false);
  });
});

describe('bulk parser', () => {
  it('nhận tên trần, tên + câu mời + lời nhắn, tab từ Excel, bỏ header và dòng trống', () => {
    const text = ['Tên\tCâu mời', 'Ba Mẹ', 'Ông Bà\tKính mời\tCháu đón Ông Bà ở cổng, nhé', '', 'Cô Hoa, Thân mời', 'Minh;;;ticket', 'Bạn X'].join('\n');
    const r = parseBulkText(text, T);
    expect(r.errors).toEqual([]);
    expect(r.rows).toEqual([
      { recipientName: 'Ba Mẹ', greeting: null, message: null, templateId: null },
      { recipientName: 'Ông Bà', greeting: 'Kính mời', message: 'Cháu đón Ông Bà ở cổng, nhé', templateId: null },
      { recipientName: 'Cô Hoa', greeting: 'Thân mời', message: null, templateId: null },
      { recipientName: 'Minh', greeting: null, message: null, templateId: 'ticket' },
      { recipientName: 'Bạn X', greeting: null, message: null, templateId: null },
    ]);
  });
  it('báo lỗi theo số dòng', () => {
    const r = parseBulkText(`A, ${'x'.repeat(41)}\nB; Kính mời; ; nope\n, Kính mời\nC; ; ${'y'.repeat(501)}`, T);
    expect(r.rows).toHaveLength(0);
    expect(r.errors.map((e) => e.line)).toEqual([1, 2, 3, 4]);
    expect(r.errors[0].message).toMatch(/Câu mời quá/);
    expect(r.errors[1].message).toMatch(/Mẫu "nope"/);
    expect(r.errors[2].message).toMatch(/Thiếu tên/);
    expect(r.errors[3].message).toMatch(/Lời nhắn quá/);
  });
  it('inviteStats đếm theo link riêng', () => {
    const st = inviteStats([
      { viewCount: 0, rsvp: null },
      { viewCount: 2, rsvp: null },
      { viewCount: 1, rsvp: { id: 'a', guestName: 'A', headcount: 3, wish: null, createdAt: new Date() } },
    ]);
    expect(st).toEqual({ total: 3, opened: 2, notOpened: 1, confirmed: 1, pending: 2, headcount: 3 });
  });
});

describe('invite.service', () => {
  it('tạo hàng loạt từ text, link riêng ra đúng tên/mẫu/câu mời, RSVP gắn đúng người', async () => {
    const { card } = await mk('inv-a');
    const r = await bulkCreateInvites(card.id, { text: 'Ba Mẹ\nCô Hoa; Kính mời; Con mời Cô đến chung vui; glass\nMinh' });
    expect(r.errors).toEqual([]);
    expect(r.created).toHaveLength(3);
    const [bm, hoa, minh] = r.created;
    expect(bm.sortOrder).toBe(1);

    const v1 = await getPublicCardByInvite('inv-a', bm.code);
    expect(v1.status).toBe('ok');
    if (v1.status === 'ok') {
      expect(v1.card.inviteLead).toBe('Thương mời');
      expect(v1.card.inviteeName).toBe('Ba Mẹ');
      expect(v1.card.recipientName).toBe('Ba Mẹ');
      expect(v1.card.template.id).toBe('print');
    }
    const v2 = await getPublicCardByInvite('inv-a', hoa.code);
    if (v2.status === 'ok') {
      expect(v2.card.inviteLead).toBe('Kính mời');
      expect(v2.card.inviteeName).toBe('Cô Hoa');
      expect(v2.card.message).toBe('Con mời Cô đến chung vui');
      expect(v2.card.template.id).toBe('glass');
    }
    // Không có lời nhắn riêng → lời nhắn chung của thiệp (ở đây rỗng).
    if (v1.status === 'ok') expect(v1.card.message).toBe('');
    const v3 = await getPublicCardByInvite('inv-a', minh.code);
    if (v3.status === 'ok') expect(v3.card.inviteeName).toBe('Minh');
    expect(await getPublicCardByInvite('inv-a', 'zzzzzz')).toEqual({ status: 'not_found' });
    expect(await getPublicCardByInvite('inv-a', 'bad')).toEqual({ status: 'not_found' });

    const rs = await submitRsvp('inv-a', { clientId: 'client-00000001', guestName: 'Hoa', headcount: 2, inviteCode: hoa.code });
    expect(rs.inviteId).toBe(hoa.id);

    const list = await listInvites('inv-a', card.id);
    expect(list.map((i) => i.recipientName)).toEqual(['Ba Mẹ', 'Cô Hoa', 'Minh']);
    expect(list[1].rsvp?.headcount).toBe(2);
    expect(list[1].viewCount).toBe(1);
    expect(list[1].url).toBe(`http://localhost:3000/inv-a/${hoa.code}`);
    expect(list[0].rsvp).toBeNull();

    const csv = await exportInvitesCsv('inv-a', card.id);
    expect(csv.startsWith('﻿"Tên","Nguồn"')).toBe(true);
    expect(csv).toContain(`"Cô Hoa","Link riêng","Kính mời","Con mời Cô đến chung vui","http://localhost:3000/inv-a/${hoa.code}","1","Đã xác nhận","2",""`);
    expect(csv).toContain(`"Ba Mẹ","Link riêng","","","http://localhost:3000/inv-a/${bm.code}","1","Đã mở, chưa phản hồi","",""`);
    expect(csv.split('\r\n')).toHaveLength(4);

    // Khách xác nhận qua link chung cũng có trong báo cáo.
    await submitRsvp('inv-a', { clientId: 'client-00000002', guestName: 'Bạn chung', headcount: 1 });
    expect(await exportInvitesCsv('inv-a', card.id)).toContain('"Bạn chung","Link chung","","","","","Đã xác nhận","1",""');
  });

  it('text có lỗi → không tạo gì; vượt 200 → 400; tạo thêm thì sort_order nối tiếp', async () => {
    const { card } = await mk('inv-b');
    const r = await bulkCreateInvites(card.id, { text: 'A\nB; Kính mời; ; nope' });
    expect(r.created).toHaveLength(0);
    expect(r.errors).toHaveLength(1);
    expect(await listInvites('inv-b', card.id)).toHaveLength(0);

    const many = Array.from({ length: 150 }, (_, i) => `Người ${i}`).join('\n');
    const ok = await bulkCreateInvites(card.id, { text: many });
    expect(ok.created).toHaveLength(150);
    const more = await bulkCreateInvites(card.id, { rows: [{ recipientName: 'X' }] });
    expect(more.created[0].sortOrder).toBe(151);
    await expect(bulkCreateInvites(card.id, { text: Array.from({ length: 60 }, (_, i) => `Y${i}`).join('\n') })).rejects.toMatchObject({ code: 'too_many_invites' });
  });

  it('sửa, xoá người nhận; xoá thì link 404 nhưng thiệp chung vẫn mở; RSVP giữ lại với invite_id null', async () => {
    const { card } = await mk('inv-c');
    const { created: [a] } = await bulkCreateInvites(card.id, { rows: [{ recipientName: 'A' }] });
    const u = await updateInvite(card.id, a.id, { recipientName: 'Anh A', greeting: 'Thân mời', templateId: 'royal' });
    expect(u).toMatchObject({ recipientName: 'Anh A', greeting: 'Thân mời', templateId: 'royal' });
    await expect(updateInvite(card.id, a.id, { templateId: 'nope' })).rejects.toMatchObject({ code: 'template_not_found' });

    const rs = await submitRsvp('inv-c', { clientId: 'client-00000009', guestName: 'A', headcount: 1, inviteCode: a.code });
    expect(rs.inviteId).toBe(a.id);
    await removeInvite(card.id, a.id);
    expect(await getPublicCardByInvite('inv-c', a.code)).toEqual({ status: 'not_found' });
    const { getPublicCard } = await import('@/modules/card');
    expect((await getPublicCard('inv-c')).status).toBe('ok');
    const { rsvpRepo } = await import('@/modules/rsvp');
    expect((await rsvpRepo.findByClient(card.id, 'client-00000009'))?.inviteId).toBeNull();
    await expect(removeInvite(card.id, a.id)).rejects.toMatchObject({ status: 404 });
  });
});
