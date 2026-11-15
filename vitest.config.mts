import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    // Mỗi worker khởi tạo một PGlite (WASM) khá tốn RAM; quá nhiều worker song song sẽ hết bộ nhớ.
    maxWorkers: 4,
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    env: { DATABASE_URL: 'postgres://test', NEXT_PUBLIC_SITE_URL: 'http://localhost:3000', ADMIN_EMAIL: 'admin@example.com' },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
