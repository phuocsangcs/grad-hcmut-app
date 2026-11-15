# Lưu ảnh thiệp: Cloudflare R2

Ảnh người dùng tải lên nằm trên **Cloudflare R2** (tương thích S3). DB vẫn là Supabase, deploy bằng Vercel.
Thiếu một trong các biến `R2_*` thì tính năng ảnh **tự tắt** (khối "Ảnh" ẩn khỏi form, API trả `storage_disabled`).

## Luồng

```
Trình duyệt ──nén ảnh──▶ POST /api/uploads/presign ──▶ link PUT có hạn 5 phút
     │                                                      │
     └──────────────PUT thẳng lên R2: pending/<id>.webp ◀───┘
Tạo thiệp (POST /api/cards, photos: ["pending/..."])
     └─ server kiểm tra file có thật + đúng loại + ≤ 3MB, rồi chép sang cards/<cardId>/<id>.webp
Xoá thiệp / thiệp hết hạn ──▶ xoá các file cards/<cardId>/...
```

Ảnh đi thẳng từ trình duyệt lên R2 vì Vercel giới hạn body của function khoảng 4.5MB.

## Thiết lập một lần

1. **Tạo bucket** trong Cloudflare dashboard → R2 → Create bucket (ví dụ `ngayratruong-photos`).
2. **Cho phép đọc công khai**: Settings của bucket → *Public access* → bật `r2.dev` (để thử), hoặc gắn tên miền riêng
   (khuyên dùng khi chạy thật, có cache CDN). Ghi lại URL công khai, không có dấu `/` cuối.
3. **Tạo API token**: R2 → *Manage R2 API Tokens* → quyền **Object Read & Write**, giới hạn vào đúng bucket này.
   Ghi lại `Access Key ID`, `Secret Access Key`. Account ID nằm ở trang R2 overview.
4. **CORS** (bắt buộc, để trình duyệt PUT được): bucket → Settings → CORS policy:

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://<tên-miền-của-bạn>"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["content-type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. **Lifecycle** (nên có): bucket → Settings → Object lifecycle rules → xoá object có prefix `pending/` sau **1 ngày**.
   Ảnh tải lên mà không gắn vào thiệp nào sẽ tự dọn.
6. **Biến môi trường** (local: `.env`; Vercel: Project → Settings → Environment Variables):

   ```
   R2_ACCOUNT_ID=
   R2_ACCESS_KEY_ID=
   R2_SECRET_ACCESS_KEY=
   R2_BUCKET=
   R2_PUBLIC_URL=https://pub-xxxx.r2.dev
   ```

7. **Migration DB**: thêm cột `cards.photos`. Chạy `pnpm db:migrate` (dùng `DIRECT_URL` của Supabase).

## Giới hạn và an toàn

- Tối đa 6 ảnh/thiệp, mỗi ảnh ≤ 3MB sau khi nén (trình duyệt tự co về 1600px, xuất WebP).
- Chỉ nhận JPEG, PNG, WebP. Link PUT được ký theo loại file; dung lượng thì server kiểm tra lại (HEAD ≤ 3MB) lúc tạo thiệp,
  file nào quá lớn hoặc sai loại sẽ bị từ chối (`photo_missing`) và không được gắn vào thiệp.
- Xin link tải lên bị giới hạn theo IP (`RULES.upload`: 40 lần/giờ, bộ nhớ trong như các giới hạn khác).
- Khoá ảnh gửi lên tạo thiệp phải đúng dạng `pending/<id>.<ext>` (xem `src/lib/storage-keys.ts`); khoá khác bị từ chối.
- Hạn mức miễn phí R2 (10 GB, miễn phí băng thông tải ra) đủ cho vài nghìn thiệp. Kiểm tra lại trang giá của Cloudflare.

## Chưa làm

- Sửa/đổi ảnh sau khi đã tạo thiệp (trang quản lý). Hiện ảnh chỉ chọn lúc tạo thiệp.
- Nhạc nền, giờ trước/sau lễ, RSVP nâng cao, lưu bút: các khối còn lại của đợt 2.
