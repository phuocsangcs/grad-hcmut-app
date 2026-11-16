import { cache } from 'react';
import type { Card } from '@/db/schema';
import { requireCardByToken } from '@/modules/manage';
import { HttpError } from '@/lib/http';

/**
 * Thiệp theo link quản lý; null nếu token sai / thiệp đã xoá.
 * cache(): layout và page trong cùng một request chỉ đọc DB một lần.
 */
export const loadManagedCard = cache(async (token: string): Promise<Card | null> => {
  try {
    return await requireCardByToken(token);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
});
