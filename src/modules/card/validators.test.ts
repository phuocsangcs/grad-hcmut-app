import { describe, expect, it } from 'vitest';
import { createCardSchema } from './card.validators';

describe('createCardSchema', () => {
  const base = { displayName: 'A', facultyId: 'cse', templateId: 'classic', slug: 'abc-def' };
  it('greetings chỉ cần một vài nhóm', () => {
    const r = createCardSchema.parse({ ...base, greetings: { friends: 'Ê,' } });
    expect(r.greetings).toEqual({ friends: 'Ê,' });
    expect(createCardSchema.parse(base).greetings).toEqual({});
  });
  it('nhóm lạ bị từ chối', () => {
    expect(() => createCardSchema.parse({ ...base, greetings: { hangxom: 'x' } })).toThrow();
  });
});
