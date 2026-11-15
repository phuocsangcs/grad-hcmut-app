/**
 * Hằng số và hàm thuần cho ảnh thiệp. Không phụ thuộc SDK nên dùng được cả ở trình duyệt.
 * Phần gọi R2 nằm trong storage.ts (chỉ chạy phía server).
 */
export const PHOTO_TYPES = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' } as const;
export type PhotoType = keyof typeof PHOTO_TYPES;

/** Dung lượng tối đa một ảnh sau khi nén ở trình duyệt. */
export const PHOTO_MAX_BYTES = 3 * 1024 * 1024;
export const MAX_PHOTOS = 6;

/** Khoá ảnh đang chờ: pending/<id>.<ext> */
export const PENDING_KEY_RE = /^pending\/[A-Za-z0-9_-]{16,40}\.(jpg|webp|png)$/;
/** Khoá ảnh đã gắn thiệp: cards/<cardId>/<id>.<ext> */
export const CARD_KEY_RE = /^cards\/[A-Za-z0-9_-]{8,40}\/[A-Za-z0-9_-]{16,40}\.(jpg|webp|png)$/;

export function isPhotoType(t: string): t is PhotoType {
  return Object.prototype.hasOwnProperty.call(PHOTO_TYPES, t);
}
