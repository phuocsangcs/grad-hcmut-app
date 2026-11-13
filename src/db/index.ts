import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getEnv } from '@/lib/env';
import * as schema from './schema';

/**
 * Một kết nối dùng chung cho cả process. Supabase pooler ở transaction mode
 * nên tắt prepared statements.
 */
const globalForDb = globalThis as unknown as { __sql?: ReturnType<typeof postgres> };

function createClient() {
  return postgres(getEnv().DATABASE_URL, { prepare: false, max: 5 });
}

const sql = globalForDb.__sql ?? createClient();
if (process.env.NODE_ENV !== 'production') globalForDb.__sql = sql;

export const db = drizzle(sql, { schema });
export type Db = typeof db;
export { schema };
