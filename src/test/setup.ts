import { vi } from 'vitest';
import { createTestDb } from './db';

/**
 * Mọi test import '@/db' sẽ nhận PGlite thay cho Supabase.
 * Mỗi file test có một DB riêng (vitest isolate theo file).
 */
const { db, client } = await createTestDb();

vi.mock('@/db', async () => {
  const schema = await import('@/db/schema');
  return { db, schema };
});

export { db, client };
