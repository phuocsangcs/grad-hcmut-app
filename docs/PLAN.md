# Plan hiện thực Backend – Thiệp tốt nghiệp Bách Khoa

Mục tiêu: làm xong toàn bộ **logic backend + data** trước, UI tạm chỉ là trang trắng
để test luồng. Khi logic chạy đúng rồi mới cắm UI đẹp vào.

Người dùng chính: **tân cử nhân** (người tạo thiệp) và khách của họ.

---

## 0. Quyết định kỹ thuật (giữ đơn giản)

| Hạng mục | Chọn | Lý do |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR bắt buộc (thiệp đọc được khi JS chưa tải), API và UI chung một repo, deploy Vercel |
| DB | **Supabase (Postgres)** | Có sẵn dashboard xem bảng, chạy SQL thống kê (A3), free tier đủ cho POC |
| Truy cập DB | **Drizzle ORM + `postgres` driver**, dùng connection string pooler của Supabase | Schema viết bằng TypeScript, migration bằng `drizzle-kit`. Chỉ server gọi DB, không dùng Supabase client phía browser nên **không cần RLS** cho MVP |
| Validation | **Zod** | Dùng chung cho API input và kiểm tra file JSON nội dung |
| Nội dung tĩnh | **JSON trong `src/content/`** (khoa, POI, quán ăn, mẫu thiệp) | Admin sửa JSON rồi push là xong (A1), có schema Zod kiểm tra khi build |
| Email | **Resend** (1 hàm `sendEmail`, có adapter log-ra-console khi dev) | Gửi link quản lý (H6), nhận báo cáo vi phạm (A2) |
| Chống spam | **Cloudflare Turnstile** + rate limit đơn giản theo IP | Chạy ngầm, không bắt khách đăng nhập |
| Test | **Vitest** cho service/lib | Test logic thuần (slug, mode, ics, token) không cần UI |
| i18n | Một file `vi.ts` + hàm `t()` | MVP chỉ tiếng Việt, mọi text đi qua một lớp để sau thêm EN |

Không dùng: Supabase Auth, Supabase Storage, Realtime, Edge Functions, Redis, admin UI. Chưa cần.

Biến môi trường: `DATABASE_URL` (Supabase pooler, port 6543), `DIRECT_URL` (port 5432, dùng cho migration),
`RESEND_API_KEY`, `ADMIN_EMAIL`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`.

---

## 1. Route công khai (URL tiếng Anh, nội dung tiếng Việt)

| Màn hình | Route |
|---|---|
| S1 Landing | `/` |
| S2 Wizard tạo thiệp | `/create` |
| S3 Xong / chia sẻ | `/create/done` |
| S4 Trang thiệp (chung) | `/[slug]` (query: `?to=parents`, `?mode=dayof`) |
| S4 Trang thiệp (riêng từng người) | `/[slug]/[code]` – `code` 6 ký tự của người nhận, ví dụ `/sang-k21/a8f3kq` |
| S8b Danh sách người nhận | `/manage/[token]/invites` |
| S5 Bản đồ | `/guide/map` |
| S6 Ăn gì | `/eat` |
| S7 Cẩm nang | `/guide` |
| S8 Quản lý | `/manage/[token]` |
| S9 Quyền riêng tư / Về dự án | `/privacy`, `/about` |
| S10 Không tồn tại / hết hạn | render trong `/[slug]` |

Slug cấm (trùng route hệ thống): `create, manage, guide, eat, privacy, about, api, _next, admin`.

Nhóm khách (`?to=`): `parents`, `grandparents`, `family`, `friends`. Hiển thị tiếng Việt qua `greetings.json`.

### Hai cấp cá nhân hoá
1. **Link chung theo nhóm** `/[slug]?to=parents`: nhanh, không cần nhập gì, dùng khi gửi vào group chat.
2. **Link riêng từng người** `/[slug]/[code]`: mỗi người nhận có tên, nhóm, lời chào riêng, có thể đổi mẫu riêng.
   Tạo hàng loạt từ bảng (dán danh sách tên từ Excel/Zalo). RSVP gắn vào đúng người nhận nên chủ thiệp
   biết chính xác ai đã xác nhận.

Một tân cử nhân chỉ có **một thiệp** (một slug, một link quản lý). Người nhận là bản ghi con của thiệp,
không phải thiệp mới. Lý do: không nhân bản thông tin lễ, một link quản lý cho tất cả, RSVP và thống kê tập trung,
sửa giờ lễ một lần là tất cả link đều cập nhật.

---

## 2. Kiến trúc thư mục (module hoá theo domain)

```
src/
  app/                      # Next.js routes – CHỈ là lớp mỏng gọi vào modules
    [slug]/page.tsx
    create/page.tsx  create/done/page.tsx
    manage/[token]/page.tsx  manage/[token]/invites/page.tsx
    [slug]/[code]/page.tsx
    guide/page.tsx  guide/map/page.tsx  eat/page.tsx
    privacy/page.tsx  about/page.tsx
    api/
      cards/route.ts                 POST tạo thiệp
      cards/check-slug/route.ts      GET kiểm tra slug + gợi ý
      cards/[slug]/route.ts          GET thiệp công khai (chung)
      cards/[slug]/[code]/route.ts   GET thiệp cá nhân hoá cho 1 người nhận
      cards/[slug]/rsvp/route.ts     POST RSVP
      cards/[slug]/ics/route.ts      GET file .ics
      cards/[slug]/qr/route.ts       GET ảnh QR
      cards/[slug]/report/route.ts   POST báo cáo vi phạm
      manage/[token]/route.ts        GET / PATCH / DELETE
      manage/[token]/rsvps/route.ts  GET danh sách RSVP + lời chúc (kèm tên người nhận)
      manage/[token]/invites/route.ts        GET danh sách / POST tạo hàng loạt
      manage/[token]/invites/[id]/route.ts   PATCH sửa 1 dòng / DELETE
      manage/[token]/invites/export/route.ts GET CSV: tên, nhóm, link, trạng thái RSVP
      recover/route.ts               POST gửi lại link quản lý qua email
  modules/                  # Toàn bộ logic nghiệp vụ nằm đây
    content/                # Dữ liệu tĩnh: khoa, lịch, POI, quán ăn, mẫu
      schema.ts   loaders.ts   eateries.ts   index.ts
    card/                   # Thiệp: tạo, đọc, sửa, xoá, slug, mode
      card.repo.ts  card.service.ts  card.validators.ts
      slug.ts  mode.ts  greeting.ts  index.ts
    invite/                 # Người nhận: tạo hàng loạt, code, lời chào riêng, mẫu riêng
      invite.repo.ts  invite.service.ts  invite.validators.ts  code.ts  bulk-parser.ts  index.ts
    rsvp/                   # RSVP + lời chúc + thống kê (gắn với invite nếu có)
      rsvp.repo.ts  rsvp.service.ts  rsvp.validators.ts  index.ts
    manage/                 # Token quản lý, khôi phục qua email
      token.ts  manage.service.ts  index.ts
    share/                  # ICS, link Google Calendar, Maps deep link, QR, OG data
      ics.ts  calendar-link.ts  maps-link.ts  qr.ts  og.ts  index.ts
    moderation/             # Báo cáo vi phạm, cờ khoá, rate limit, Turnstile
      report.service.ts  turnstile.ts  rate-limit.ts  index.ts
  db/
    schema.ts               # Drizzle schema (nguồn sự thật, xem docs/SCHEMA.md)
    index.ts                # kết nối postgres
    migrations/             # drizzle-kit generate
  content/                  # File JSON admin sửa tay
    faculties.json  pois.json  eateries.json  templates.json  greetings.json
  lib/                      # Hạ tầng dùng chung, không chứa nghiệp vụ
    env.ts  email.ts  time.ts (Asia/Ho_Chi_Minh)  i18n/  http.ts (helper trả lỗi)
  scripts/
    stats.sql  cleanup-expired.ts
```

Quy ước:
- **route → service → repo → db**. Route không chứa logic, repo không chứa nghiệp vụ.
- Mỗi module export qua `index.ts`, module khác chỉ import từ đó.
- Mọi input vào service đều qua Zod trước.
- Hàm thuần (slug, mode, ics…) tách riêng để test bằng Vitest không cần DB.

---

## 3. Mô hình dữ liệu

Xem chi tiết và SQL ở **`docs/SCHEMA.md`**. Tóm tắt: 4 bảng `cards`, `invites`, `rsvps`, `reports`.
Dữ liệu tĩnh (khoa, POI, quán, mẫu, nhóm khách) không nằm trong DB mà trong JSON.

---

## 4. Các phase (không ước lượng thời gian, làm xong phase nào test phase đó)

### Phase 0 – Khung dự án
- `create-next-app` TS, path alias `@/`, ESLint, Prettier.
- Tạo project Supabase, lấy 2 connection string, điền `.env.local`, có `.env.example`.
- Drizzle + `postgres`, `drizzle.config.ts`, script `db:generate`, `db:migrate`, `db:studio`.
- `lib/env.ts` (Zod kiểm tra env), `db/index.ts`, `lib/time.ts`, `lib/i18n`.
- Vitest chạy được 1 test mẫu.
- **Xong khi:** `pnpm dev` chạy, `pnpm test` xanh, migration đầu tiên tạo 3 bảng trên Supabase.

### Phase 1 – Module `content` → A1, nền cho H1, G5, G7, V1
- Schema Zod cho 5 file JSON và điền dữ liệu thật:
  - `faculties.json`: id, tên, ngày giờ lễ, hội trường (theo lịch trường, có link nguồn).
  - `pois.json`: A5, WC, bãi xe, nước, chỗ ngồi chờ, góc chụp ảnh – toạ độ trên SVG, ảnh, ghi chú, ngày cập nhật.
  - `eateries.json`: ~10 quán, ngân sách, nhóm đông, đậu ô tô, link Maps.
  - `templates.json`: id, tên, mô tả (UI sau này đọc id này).
  - `greetings.json`: preset cho `parents / grandparents / family / friends`.
- Loader có cache, `filterEateries({ budget, bigGroup, carParking })`.
- Script `content:check` chạy trong `prebuild`, JSON sai thì fail.
- **Xong khi:** test loader + filter xanh, build fail khi JSON sai.

### Phase 2 – Module `card` lõi → H1, H3, H4, G1, F3
- `slug.ts`: chuẩn hoá (bỏ dấu, kebab, 3–40 ký tự), slug cấm, gợi ý khi trùng (`sang-k21`, `sang-cse`, `sang-2026`).
- `mode.ts`: `before | dayof | after` theo giờ VN, `?mode=` để test.
- `greeting.ts`: resolve lời chào theo thứ tự: lời chào riêng của người nhận > override theo nhóm của chủ thiệp > preset `greetings.json` > mặc định. Tương tự cho mẫu: `invite.template_id` > `card.template_id`.
- `card.service.ts`: `createCard` (tự điền từ khoa, sinh manage token, trả token thô đúng 1 lần), `getPublicCard(slug)` (ẩn trường nhạy cảm, tăng `view_count`, trả `not_found | locked | expired`), `checkSlug`.
- API: `POST /api/cards`, `GET /api/cards/check-slug`, `GET /api/cards/[slug]`, `GET /api/cards/[slug]/[code]`.
- Trang `/[slug]` và `/[slug]/[code]` SSR tạm: in JSON thiệp ra để test.
- **Xong khi:** tạo thiệp qua curl được, mở `/[slug]?to=parents&mode=dayof` ra đúng dữ liệu, test slug/mode/greeting xanh.

### Phase 3 – Module `rsvp` + `manage` → G2, H5, H6, F4
- `rsvp.service.ts`: `submitRsvp` (upsert theo `(card_id, client_id)` để mở lại không hỏi lại), `listByCard`, `summary` ("12 người sẽ đến · 8 lời chúc").
- `token.ts`: token ngẫu nhiên 32 byte, lưu SHA-256, `verifyToken`.
- `manage.service.ts`: `getOverview`, `updateCard` (sửa thông tin, đổi mẫu, đổi điểm hẹn), `deleteCard`, `sendRecoveryEmail`.
- `lib/email.ts` với 2 adapter: console (dev) và Resend (prod).
- API: `POST /api/cards/[slug]/rsvp`, `GET/PATCH/DELETE /api/manage/[token]`, `GET /api/manage/[token]/rsvps`, `POST /api/recover`.
- **Xong khi:** RSVP 2 lần cùng `client_id` chỉ có 1 dòng; sai token trả 404; xoá thiệp xoá luôn RSVP (cascade).

### Phase 3b – Module `invite` (tạo hàng loạt) → H8, H5
- `code.ts`: sinh code 6 ký tự (a–z, 0–9, bỏ ký tự dễ nhầm), unique trong phạm vi 1 thiệp.
- `bulk-parser.ts`: parse văn bản dán vào. Chấp nhận:
  - mỗi dòng 1 tên: `Ba Mẹ`
  - dòng có nhóm: `Cô Hoa, family` hoặc tab-separated dán từ Excel `Cô Hoa<TAB>family<TAB>Lời chào riêng`
  - trả về danh sách dòng hợp lệ + dòng lỗi kèm số dòng, không tạo gì nếu có lỗi.
- `invite.service.ts`: `bulkCreate(cardId, rows)` (tối đa 200 người / thiệp, bỏ qua trùng tên nếu người dùng chọn), `list`, `update` (tên, nhóm, lời chào, mẫu), `remove`, `exportCsv` (tên, nhóm, link đầy đủ, đã RSVP chưa, số người, lời chúc).
- `rsvp.service.ts` cập nhật: nhận `invite_id` tuỳ chọn, điền sẵn `guest_name` và `group_key` từ invite; `summary` tách "đã mời / đã xác nhận".
- API: `GET/POST /api/manage/[token]/invites`, `PATCH/DELETE /api/manage/[token]/invites/[id]`, `GET /api/manage/[token]/invites/export`.
- Trang `/manage/[token]/invites` UI trần: textarea dán danh sách → preview bảng → tạo → bảng kết quả có nút copy link từng dòng và tải CSV.
- **Xong khi:** dán 20 tên từ Excel tạo được 20 link, mở `/[slug]/[code]` ra đúng tên và mẫu riêng, RSVP từ link đó hiện đúng tên trong trang quản lý, xoá 1 người thì link đó trả 404 nhưng thiệp chung vẫn mở.

**Quy tắc sản phẩm:** wizard `/create` giữ nguyên 3 bước để vẫn dưới 60 giây. Tạo hàng loạt nằm ở trang quản lý,
và màn `/create/done` có CTA "Thêm người nhận để gửi riêng từng người".

### Phase 4 – Module `share` → G3, G4, H2
- `ics.ts`: file `.ics` timezone VN, có địa điểm, nhắc trước 1 giờ.
- `calendar-link.ts`: link Google Calendar.
- `maps-link.ts`: deep link chỉ đường tới cổng trường, link tới POI / quán.
- `qr.ts`: QR PNG/SVG cho link thiệp (chung hoặc riêng từng người).
- `og.ts`: metadata cho thẻ Zalo/Messenger (title, description, ảnh theo template). Link riêng dùng tên người nhận trong title, ví dụ "Sang gửi thiệp tốt nghiệp cho Cô Hoa". Ảnh OG động để sau.
- API: `GET /api/cards/[slug]/ics`, `GET /api/cards/[slug]/qr`, `generateMetadata` ở `/[slug]`.
- **Xong khi:** `.ics` import vào Google Calendar đúng giờ, QR scan ra đúng link.

### Phase 5 – Module `moderation` + vận hành → A2, A3, F5
- `turnstile.ts`: verify token server-side khi tạo thiệp.
- `rate-limit.ts`: giới hạn theo IP cho tạo thiệp / RSVP / báo cáo (in-memory, đủ cho POC).
- `report.service.ts`: lưu `reports` + gửi email admin; cờ `locked` ẩn thiệp.
- `scripts/stats.sql`: chạy trong Supabase SQL editor ra số thiệp, lượt mở, RSVP.
- `scripts/cleanup-expired.ts`: xoá thiệp quá `expires_at` (chạy tay hoặc Vercel cron).
- **Xong khi:** gửi báo cáo nhận được email, `locked=true` thì slug trả 404, stats ra số.

### Phase 6 – Nối luồng end-to-end bằng UI trần → F1, F2, F4, F6
- `/create` form HTML đơn giản gọi API, lưu nháp localStorage.
- `/create/done` hiện link, QR, link quản lý, ô email, nút "Gửi cho Ba Mẹ" (`?to=parents`), CTA "Thêm người nhận" → `/manage/[token]/invites`.
- `/[slug]` render đủ block theo mode nhưng chưa style.
- `/manage/[token]`, `/guide`, `/eat` đọc từ content.
- Test tay trong Zalo trên Android cũ (SSR, `tel:`, deep link Maps).
- **Xong khi:** đi hết F1 → F2 → F3 (`?mode=dayof`) → F4 → F5 không cần sửa code.

Sau phase 6 mới làm UI đẹp (template thiệp, phong bì, SVG bản đồ). API và data đã cố định nên UI chỉ việc gọi.

---

## 5. Bảng đối chiếu use case → phase

| Use case | Phase |
|---|---|
| H1 tạo thiệp, H3 lời chào theo nhóm, H4 điểm hẹn | 2 |
| H2 chia sẻ (link, QR, share) | 4 (+6 nút share) |
| H5 quản lý, H6 lấy lại link | 3 |
| H8 tạo hàng loạt người nhận, link riêng, export CSV (mới) | 3b |
| G1 mở thiệp, G6 chế độ ngày lễ | 2 (mode) + 6 |
| G2 RSVP | 3 |
| G3 lịch, G4 chỉ đường | 4 |
| G5 bản đồ, G7 quán ăn, V1 cẩm nang | 1 (data) + 6 |
| G8 CTA tạo thiệp | 6 |
| A1 sửa JSON | 1 |
| A2 báo cáo / khoá, A3 số liệu | 5 |
| F5 tự xoá sau lễ | 2 (`expires_at`) + 5 (cleanup) |

---

## 6. Việc để sau (không làm trong MVP)
- Ảnh thiệp dạng story, ảnh OG động theo từng thiệp / từng người nhận.
- Tải ZIP nhiều QR, gửi tin nhắn Zalo tự động theo danh sách (Zalo không có API công khai cho cá nhân, chỉ copy link).
- Upload file .xlsx thật (MVP chỉ dán text, đủ dùng vì Excel copy ra là tab-separated).
- Song ngữ EN (chỉ cần thêm `en.ts`, text đã qua `t()`).
- Lời nhắn giọng nói / video, album chung (lúc đó mới cần Supabase Storage).
- Rate limit bằng Upstash/KV khi scale. RLS nếu sau này dùng Supabase client phía browser.
