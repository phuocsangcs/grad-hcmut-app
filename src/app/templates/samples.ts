/**
 * Thiệp mẫu dùng để xem trước từng mẫu (trang chủ + /templates).
 * Mỗi mẫu đi với một khoa để thấy màu/hoạ tiết đổi theo khoa. Đổi khoa/tên ở đây nếu muốn.
 */
export const TEMPLATE_SAMPLES: Record<string, { facultyId: string; displayName: string }> = {
  print: { facultyId: 'cse', displayName: 'Nguyễn Minh Anh' },
  glass: { facultyId: 'che', displayName: 'Trần Thu Hà' },
  airy: { facultyId: 'env', displayName: 'Phạm Gia Hân' },
  blueprint: { facultyId: 'ce', displayName: 'Võ Hoàng Long' },
  ticket: { facultyId: 'eee', displayName: 'Đặng Khánh Linh' },
  riso: { facultyId: 'me', displayName: 'Lê Quốc Bảo' },
  royal: { facultyId: 'cse', displayName: 'Nguyễn Minh Anh' },
  portrait: { facultyId: 'cse', displayName: 'Nguyễn Minh Anh' },
};

/** Ảnh mẫu cho các mẫu có ảnh bìa (ảnh thật trong public/images/samples). */
export const SAMPLE_PHOTOS: Record<string, string[]> = {
  portrait: ['/images/samples/ky-yeu-2.jpg', '/images/samples/ky-yeu-1.jpg'],
};

export function sampleOptionsFor(templateId: string, extra: { mode?: string } = {}) {
  const x = TEMPLATE_SAMPLES[templateId] ?? TEMPLATE_SAMPLES.print;
  return { templateId, ...x, photos: SAMPLE_PHOTOS[templateId], ...extra };
}
