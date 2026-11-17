/**
 * Thiệp mẫu dùng để xem trước từng mẫu (trang chủ + /templates).
 * Mỗi mẫu đi với một khoa để thấy màu/hoạ tiết đổi theo khoa. Đổi khoa/tên ở đây nếu muốn.
 */
export const TEMPLATE_SAMPLES: Record<string, { facultyId: string; displayName: string }> = {
  print: { facultyId: 'cse', displayName: 'Nguyễn Minh Anh' },
  glass: { facultyId: 'che', displayName: 'Trần Thu Hà' },
  blueprint: { facultyId: 'ce', displayName: 'Võ Hoàng Long' },
  ticket: { facultyId: 'eee', displayName: 'Đặng Khánh Linh' },
  royal: { facultyId: 'cse', displayName: 'Nguyễn Minh Anh' },
  portrait: { facultyId: 'cse', displayName: 'Nguyễn Minh Anh' },
  dossier: { facultyId: 'cse', displayName: 'Nguyễn Minh Anh' },
  feed: { facultyId: 'cse', displayName: 'Trần Thu Hà' },
  scrapbook: { facultyId: 'che', displayName: 'Đặng Khánh Linh' },
  journey: { facultyId: 'me', displayName: 'Lê Quốc Bảo' },
  postcard: { facultyId: 'env', displayName: 'Phạm Ngọc Hân' },
  magazine: { facultyId: 'eee', displayName: 'Hoàng Gia Huy' },
};

/** Ảnh mẫu (ảnh AI, không phải người thật) cho các mẫu có ảnh bìa: ảnh đầu là bìa, còn lại vào album. */
const AI_PHOTOS = ['/images/samples/ai-chan-dung-nam.jpg', '/images/samples/ai-chan-dung-nu.jpg', '/images/samples/ai-chan-dung-nam-2.jpg'];
const S = '/images/samples';
export const SAMPLE_PHOTOS: Record<string, string[]> = {
  portrait: AI_PHOTOS,
  dossier: AI_PHOTOS,
  feed: [`${S}/ai-chan-dung-nu-2.jpg`, `${S}/ai-chan-dung-nu-3.jpg`, `${S}/ai-chan-dung-nu.jpg`],
  scrapbook: [`${S}/ai-chan-dung-nu-3.jpg`, `${S}/ai-chan-dung-nu-2.jpg`, `${S}/ai-chan-dung-nu.jpg`],
  journey: [`${S}/ai-chan-dung-nam-3.jpg`, `${S}/ai-chan-dung-nam.jpg`, `${S}/ai-chan-dung-nam-2.jpg`],
  postcard: [`${S}/ai-chan-dung-nu-4.jpg`, `${S}/ai-chan-dung-nu-5.jpg`, `${S}/ai-chan-dung-nu.jpg`],
  magazine: [`${S}/ai-chan-dung-nam.jpg`, `${S}/ai-chan-dung-nam-2.jpg`, `${S}/ai-chan-dung-nam-3.jpg`],
};

export function sampleOptionsFor(templateId: string, extra: { mode?: string } = {}) {
  const x = TEMPLATE_SAMPLES[templateId] ?? TEMPLATE_SAMPLES.print;
  return { templateId, ...x, photos: SAMPLE_PHOTOS[templateId], ...extra };
}
