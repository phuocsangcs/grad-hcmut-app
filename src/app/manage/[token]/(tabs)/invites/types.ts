/** Dữ liệu một khách gửi xuống client (đã bỏ thông tin nội bộ). */
export type GuestRow = {
  id: string;
  code: string;
  name: string;
  /** Câu mời riêng; null → câu mời của thiệp. */
  greeting: string | null;
  /** Lời nhắn riêng; null → lời nhắn chung. */
  message: string | null;
  templateId: string | null;
  url: string;
  views: number;
  rsvp: { headcount: number; wish: string | null } | null;
};

/** Giá trị mặc định của thiệp, hiện làm placeholder khi khách để trống. */
export type GuestDefaults = {
  slug: string;
  lead: string;
  message: string;
  leads: string[];
  templates: { id: string; name: string }[];
};
