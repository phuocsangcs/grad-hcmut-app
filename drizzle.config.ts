import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    // Migration dùng kết nối trực tiếp (port 5432), không qua pooler.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
});
