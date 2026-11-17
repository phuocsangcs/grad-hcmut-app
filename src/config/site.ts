/**
 * Cấu hình hiển thị của site (không phải bí mật). Sửa ở đây thay vì rải trong trang.
 */
export const site = {
  name: 'Ngày Ra Trường',
  /** Email liên hệ hiển thị ở trang Về dự án. null → ẩn. */
  contactEmail: null as string | null,
  donate: {
    /** Đặt ảnh QR vào public/images/site/ rồi điền đường dẫn, ví dụ '/images/site/donate-qr.png'. null → ẩn ảnh. */
    qrImage: '/images/site/donate-qr.jpg' as string | null,
    /** Kích thước gốc của ảnh QR (để giữ đúng tỉ lệ). */
    qrSize: { width: 828, height: 873 },
    note: 'Tiền cà phê dùng để trả VPS và tên miền. Cảm ơn bạn!',
  },
} as const;
