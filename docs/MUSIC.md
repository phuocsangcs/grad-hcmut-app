# Nhạc nền

Danh sách bài nằm ở `src/content/music.json`. **Hiện để trống**, nên khối "Nhạc nền" tự ẩn ở form tạo thiệp và trang quản lý.
Thêm bài thì khối này tự hiện.

## Thêm một bài

1. Đặt file âm thanh vào `public/music/` (ví dụ `public/music/gio-tot-nghiep.mp3`), hoặc đưa lên R2 và dùng URL công khai.
   Nên dùng MP3 khoảng 128 kbps, dưới 4MB, để mở thiệp trên 4G vẫn nhanh.
2. Thêm một mục vào `items`:

   ```json
   {
     "id": "gio-tot-nghiep",
     "title": "Giờ tốt nghiệp",
     "artist": "Tên nghệ sĩ",
     "src": "/music/gio-tot-nghiep.mp3",
     "license": "CC BY 4.0, nguồn: https://..."
   }
   ```

3. Chạy lại `pnpm dev` hoặc build. File JSON được kiểm tra khi khởi động, sai cấu trúc sẽ báo lỗi ngay.

## Bản quyền

Chỉ đưa vào bài bạn **được phép dùng công khai** (nhạc tự làm, nhạc có giấy phép như CC0/CC BY, hoặc có xin phép).
Trường `license` bắt buộc để ghi lại nguồn. Không cho người dùng tự tải nhạc lên, để tránh vi phạm bản quyền.

## Cách phát

Trình duyệt chặn tự phát tiếng, nên thiệp hiện nút "Bật nhạc" ở góc dưới. Lần chạm đầu tiên vào thiệp sẽ bắt đầu phát,
trừ khi khách đã tự bấm tắt. Khách tắt/bật được bất cứ lúc nào.
