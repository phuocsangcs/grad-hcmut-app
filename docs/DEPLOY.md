# Deploy: Vercel + Supabase + Cloudflare R2

```
push / pull request ──▶ GitHub Actions (CI): content:check, lint, typecheck, test, build
        │
        └──▶ Vercel (tích hợp Git, CD): push main → production, pull request → bản preview
DB: Supabase (migration chạy tay bằng workflow "Migrate DB")
Ảnh: Cloudflare R2 (xem STORAGE.md)
```

CI nằm ở `.github/workflows/ci.yml`. CD do Vercel làm, nên không cần workflow deploy riêng.

## Thiết lập một lần

### 1. Đẩy code lên GitHub
Repo: `origin` (https://github.com/phuocsangcs/grad-hcmut-app). Push `main` thì CI tự chạy.
Bật **branch protection** cho `main` (Settings → Branches): yêu cầu job `Kiểm tra và build` pass trước khi merge.

### 2. Nối Vercel với repo
1. vercel.com → **Add New → Project** → chọn repo → Import.
2. Framework: Next.js (tự nhận). Build command để mặc định (`pnpm build`, đã gồm `prebuild` kiểm tra nội dung). pnpm tự nhận từ `packageManager`.
3. `vercel.json` đã đặt region `sin1` (Singapore, gần Supabase `ap-southeast-1`) và cron dọn thiệp hết hạn mỗi ngày.
4. Thêm **Environment Variables** (Project → Settings → Environment Variables, chọn Production và Preview) trước khi bấm Deploy:

| Biến | Ghi chú |
|---|---|
| `DATABASE_URL` | Supabase pooler, cổng 6543 (Transaction mode) |
| `DIRECT_URL` | Supabase direct, cổng 5432 (chỉ cần cho migration, có thể để trống ở Vercel) |
| `NEXT_PUBLIC_SITE_URL` | URL production, ví dụ `https://ngayratruong.vn`, không có `/` cuối. Nên đặt khi có tên miền riêng. Không đặt thì code tự lấy tên miền Vercel (`VERCEL_PROJECT_PRODUCTION_URL` ở production, `VERCEL_URL` ở preview), không bao giờ ra `localhost` trên Vercel |
| `CRON_SECRET` | Chuỗi ngẫu nhiên dài. **Bắt buộc** ở production, thiếu thì cron bị từ chối. Vercel tự gửi kèm khi gọi cron |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` | Ảnh thiệp, xem STORAGE.md |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL` | Tuỳ chọn: email lấy lại link, báo cáo vi phạm, và báo tin nhắn mới từ trang Liên hệ về `ADMIN_EMAIL` (email này không hiện trên web) |
| `ADMIN_TOKEN` | Tuỳ chọn: mật khẩu vào `/admin/inbox` để đọc tin nhắn Liên hệ. Chuỗi ngẫu nhiên ≥ 16 ký tự. Không đặt thì trang quản trị tắt (tin nhắn vẫn được lưu) |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Tuỳ chọn: chống bot khi tạo thiệp |

Với bản **Preview**, nên dùng một DB Supabase riêng (hoặc chấp nhận preview dùng chung DB), đừng để preview ghi vào dữ liệu thật mà không biết.

### 3. Migration DB
Trước deploy đầu tiên, và mỗi khi có file mới trong `src/db/migrations/`:
- Cách 1: GitHub → Actions → **Migrate DB** → Run workflow. Cần secret `DIRECT_URL` (Settings → Secrets and variables → Actions) và environment `production` (có thể bật Required reviewers).
- Cách 2: ở máy bạn, `pnpm db:migrate`.

Migration chỉ **thêm** cột (an toàn khi bản cũ còn chạy), nên chạy migration **trước** rồi mới deploy code mới.

### 4. Sau khi có URL production
- Cập nhật `NEXT_PUBLIC_SITE_URL` đúng URL và deploy lại (QR, link chia sẻ, email dùng biến này).
- Thêm URL vào **CORS** của bucket R2 (`AllowedOrigins`), nếu không ảnh không tải lên được từ trình duyệt.
- Nếu dùng Turnstile: thêm domain vào danh sách của site key.

## Quy trình hằng ngày
1. Tạo nhánh, push, mở pull request → CI chạy, Vercel dựng bản preview và comment link vào PR.
2. Merge vào `main` → CI chạy lại, Vercel deploy production.
3. Có đổi schema: chạy `pnpm db:generate`, commit file migration, chạy **Migrate DB** rồi mới merge.

## Rollback
Vercel → Deployments → chọn bản cũ → **Promote to Production** (nhanh, không cần build lại). Migration chỉ thêm cột nên bản code cũ vẫn chạy được.

## Kiểm tra sau deploy
- `/` và `/templates` mở được; tạo thử một thiệp, mở link thiệp và link quản lý.
- Tải thử một ảnh (kiểm tra CORS R2).
- Chạy tay cron: `curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron/cleanup`
