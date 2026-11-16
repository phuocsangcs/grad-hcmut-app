import { describe, expect, it } from 'vitest';
import { createCardSchema } from './card.validators';

describe('createCardSchema', () => {
  const base = { displayName: 'A', facultyId: 'cse', templateId: 'print', slug: 'abc-def' };
  it('lời mời tuỳ chọn, được cắt khoảng trắng', () => {
    const r = createCardSchema.parse({ ...base, inviteLead: '  Thân mời ', inviteeName: 'Cô Hoa' });
    expect(r).toMatchObject({ inviteLead: 'Thân mời', inviteeName: 'Cô Hoa' });
    expect(createCardSchema.parse(base).inviteLead).toBeUndefined();
  });
  it('câu mời quá dài bị từ chối', () => {
    expect(() => createCardSchema.parse({ ...base, inviteLead: 'x'.repeat(41) })).toThrow();
  });
});
