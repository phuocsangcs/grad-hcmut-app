# Thiệp tốt nghiệp Bách Khoa

Xem `docs/PLAN.md` (kế hoạch, kiến trúc) và `docs/SCHEMA.md` (DB).

## Chạy local

```bash
pnpm install
cp .env.example .env.local   # điền DATABASE_URL / DIRECT_URL từ Supabase
pnpm db:migrate              # tạo bảng trên Supabase
pnpm dev
```

## Lệnh thường dùng

| Lệnh | Việc |
|---|---|
| `pnpm test` | chạy Vitest |
| `pnpm typecheck` | kiểm tra TypeScript |
| `pnpm content:check` | kiểm tra các file JSON trong `src/content` |
| `pnpm db:generate` | sinh migration từ `src/db/schema.ts` |
| `pnpm db:migrate` | áp migration lên DB |
| `pnpm db:studio` | xem dữ liệu |

## Cấu trúc

- `src/app` – route Next.js, chỉ là lớp mỏng gọi vào modules
- `src/modules/*` – nghiệp vụ theo domain (content, card, invite, rsvp, manage, share, moderation)
- `src/db` – Drizzle schema + migrations
- `src/content` – dữ liệu tĩnh dạng JSON (khoa, POI, quán ăn, mẫu, lời chào)
- `src/lib` – hạ tầng dùng chung (env, time, i18n, http)
