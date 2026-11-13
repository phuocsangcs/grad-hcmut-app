/** Chạy tay: pnpm tsx scripts/cleanup-expired.ts (đọc .env.local) */
import 'dotenv/config';
import { cleanupExpiredCards } from '../src/modules/moderation/report.service';

cleanupExpiredCards()
  .then((n) => {
    console.log(`Đã xoá ${n} thiệp hết hạn.`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
