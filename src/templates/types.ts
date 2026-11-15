import type { ComponentType, ReactNode } from 'react';
import type { PublicCard } from '@/modules/card';
import type { Faculty } from '@/modules/content';

/**
 * Hợp đồng giữa trang thiệp và một template.
 *
 * Template chỉ lo "lớp vỏ": bố cục, màu, chữ, hình. Mọi dữ liệu và hành vi
 * (RSVP, đếm ngược, link lịch/chỉ đường, điểm hẹn) được dựng sẵn thành `blocks`
 * và đưa vào; template đặt chúng ở đâu tuỳ ý, hoặc tự vẽ lại một block nếu cần.
 * Nhờ vậy thêm template mới không phải chạm vào logic.
 */
export type TemplateLinks = {
  card: string;
  ics: string;
  qr: string;
  googleCalendar: string;
  directions: string;
  meetingPoi: string | null;
  call: string | null;
  messenger: string;
};

export type TemplateBlocks = {
  /** Ngày · giờ · nơi (3 ô). */
  ceremony: ReactNode;
  /** Đếm ngược sống (client). */
  countdown: ReactNode;
  /** Form RSVP hoặc trạng thái đã xác nhận. null ở chế độ after. */
  rsvp: ReactNode | null;
  /** Điểm hẹn sau lễ, null nếu người tạo không chọn. */
  meeting: ReactNode | null;
  /** Hàng nút: chỉ đường, thêm lịch, gọi. */
  actions: ReactNode;
  /** Lời cảm ơn + ngày tự xoá; chỉ có ở chế độ after. */
  after: ReactNode | null;
  /** Khám phá: bản đồ, ăn gì, cẩm nang + CTA tạo thiệp + báo cáo. */
  explore: ReactNode;
};

export type TemplateProps = {
  card: PublicCard;
  /** Bản ghi khoa đầy đủ (màu nhấn, câu chủ đề, hình vẽ). */
  faculty: Faculty;
  links: TemplateLinks;
  blocks: TemplateBlocks;
  /** Lời mời hiển thị: message của thiệp, hoặc invitation mặc định của khoa. */
  message: string;
  /** Đang xem trước trong wizard: tắt animation dài, không gọi API. */
  preview?: boolean;
};

export type TemplateDefinition = {
  id: string;
  /** Nền tối hay sáng – ảnh hưởng màu thanh trạng thái / nút chia sẻ. */
  scheme: 'light' | 'dark';
  Component: ComponentType<TemplateProps>;
};
