import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import * as schema from '@/db/schema';

/**
 * DB Postgres chạy trong bộ nhớ (PGlite) cho test tích hợp.
 * Áp đúng các file migration thật nên schema test = schema prod.
 */
export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  const dir = path.resolve(__dirname, '../db/migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sqlText = readFileSync(path.join(dir, f), 'utf8');
    for (const stmt of sqlText.split('--> statement-breakpoint')) {
      const s = stmt.trim();
      if (s) await client.exec(s);
    }
  }
  return { db, client };
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>['db'];
