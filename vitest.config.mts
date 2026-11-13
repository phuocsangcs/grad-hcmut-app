import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    env: { DATABASE_URL: 'postgres://test', NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
