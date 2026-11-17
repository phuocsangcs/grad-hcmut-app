/**
 * Chương trình chi tiết các buổi lễ, chép từ thông báo chính thức của Trường (đăng 09/11/2026):
 * https://hcmut.edu.vn/tintuc/thong-bao-to-chuc-le-tot-nghiep-thang-11-nam-2026
 * Trường ghi "dự kiến"; lịch từng khoa nằm ở src/content/faculties.json.
 */
export type ProgramRow = { time: string; event: string };
export type Program = {
  id: string;
  title: string;
  when: string;
  venue: string;
  attendees: string;
  rows: ProgramRow[];
};

export const PROGRAMS: Program[] = [
  {
    id: 'sau-dai-hoc',
    title: 'Lễ tốt nghiệp Sau đại học',
    when: '13g30, thứ Năm, 26/11/2026',
    venue: 'Hội trường A5',
    attendees: 'Ban lãnh đạo trường và khách mời; nghiên cứu sinh, học viên cao học và gia đình.',
    rows: [
      { time: '13g30 – 13g50', event: 'Đón khách, nghiên cứu sinh, học viên cao học tốt nghiệp và gia đình' },
      { time: '13g50 – 14g00', event: 'Nghi thức chào cờ; Tuyên bố lý do; Giới thiệu đại biểu' },
      { time: '14g00 – 14g10', event: 'Diễn văn chúc mừng của Hiệu trưởng' },
      { time: '14g10 – 14g20', event: 'Văn nghệ; Video chúc mừng' },
      { time: '14g20 – 14g25', event: 'Phát biểu của đại diện tân tiến sĩ' },
      { time: '14g25 – 14g45', event: 'Trao bằng Tiến sĩ' },
      { time: '14g45 – 14g50', event: 'Khen thưởng học viên cao học xuất sắc' },
      { time: '14g50 – 15g15', event: 'Trao bằng Thạc sĩ' },
      { time: '15g15 – 15g20', event: 'Chụp hình tập thể' },
      { time: '15g20', event: 'Kết thúc chương trình' },
    ],
  },
  {
    id: 'cap-truong',
    title: 'Lễ cấp trường bậc Đại học',
    when: '07g00, thứ Sáu, 27/11/2026',
    venue: 'Hội trường A5',
    attendees:
      'Ban lãnh đạo trường và khách mời; sinh viên đạt Cúp toàn năng, Huy chương vàng; sinh viên Vừa làm Vừa học tốt nghiệp xuất sắc; sinh viên tốt nghiệp trước thời hạn; sinh viên PFIEV, chương trình Tài năng; sinh viên có điểm tốt nghiệp từ 3.7 trở lên; gia đình của sinh viên.',
    rows: [
      { time: '07g00 – 07g30', event: 'Đón khách, sinh viên tốt nghiệp và gia đình' },
      { time: '07g30 – 07g40', event: 'Văn nghệ chào mừng' },
      { time: '07g40 – 07g50', event: 'Nghi thức chào cờ; Tuyên bố lý do; Giới thiệu đại biểu' },
      { time: '07g50 – 08g00', event: 'Diễn văn khai mạc và chúc mừng của Hiệu trưởng' },
      { time: '08g00 – 08g10', event: 'Phát biểu của khách mời' },
      { time: '08g10 – 08g20', event: 'Phát biểu của đại diện Ban Đại diện Cộng đồng Cựu sinh viên Phú Thọ - Bách khoa (BKA)' },
      { time: '08g20 – 08g25', event: 'Video chúc mừng tốt nghiệp' },
      { time: '08g25 – 08g45', event: 'Khen thưởng và trao bằng cho sinh viên đạt Cúp toàn năng, Huy chương vàng; sinh viên Vừa làm Vừa học tốt nghiệp xuất sắc; sinh viên tốt nghiệp trước thời hạn' },
      { time: '08g45 – 08g50', event: 'Phát biểu của đại diện tân cử nhân' },
      { time: '08g50 – 09g10', event: 'Trao bằng tốt nghiệp cho sinh viên chương trình Tài năng và chương trình PFIEV' },
      { time: '09g10 – 09g30', event: 'Trao bằng tốt nghiệp cho sinh viên xếp loại xuất sắc, giỏi có điểm tốt nghiệp từ 3.7 trở lên' },
      { time: '09g30 – 09g35', event: 'Chụp hình tập thể' },
      { time: '09g35', event: 'Kết thúc chương trình' },
    ],
  },
];

/** Lưu ý quan trọng trong thông báo (rút gọn câu chữ, giữ nguyên ý). */
export const NOTICE_NOTES = [
  'Thư mời và lễ phục: nghiên cứu sinh, học viên cao học nhận tại phòng Đào tạo; sinh viên nhận tại Khoa/Văn phòng Đào tạo Quốc tế theo thông báo của từng đơn vị.',
  'Sinh viên, học viên mặc lễ phục đúng mẫu của Nhà trường. Người nhà vui lòng mặc trang phục lịch sự.',
  'Ngồi đúng vị trí quy định trong hội trường, hạn chế ra ngoài khi chương trình đang diễn ra và không ra về trước khi kết thúc.',
  'Mã QR chứa ảnh buổi lễ được gửi kèm email thông báo Lễ tốt nghiệp. Ảnh đã xử lý được đăng lên trang cá nhân MyBK sau 1–2 tuần.',
];
