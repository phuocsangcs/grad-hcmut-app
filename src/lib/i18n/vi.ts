/**
 * Toàn bộ chuỗi hiển thị. Sau này thêm en.ts cùng shape là có song ngữ.
 */
export const vi = {
  app: {
    name: 'Thiệp tốt nghiệp Bách Khoa',
    tagline: 'Tạo thiệp mời lễ tốt nghiệp trong 60 giây',
  },
  card: {
    defaultVenue: 'Hội trường A5',
    notFound: 'Thiệp này không tồn tại hoặc đã bị gỡ.',
    expired: 'Thiệp này đã hết hạn.',
    locked: 'Thiệp này tạm thời không hiển thị.',
    createYourOwn: 'Bạn sắp tốt nghiệp? Tạo thiệp của bạn',
    todayBanner: 'Hôm nay!',
    hoursLeft: (h: number) => `còn ${h} giờ`,
    minutesLeft: (m: number) => `còn ${m} phút`,
    started: 'đang diễn ra',
    thankYou: 'Cảm ơn mọi người đã đến chung vui',
    willDelete: (date: string) => `Thiệp sẽ tự xoá vào ngày ${date}`,
  },
  greeting: {
    default: 'Gửi bạn,',
    to: (name: string) => `Gửi ${name},`,
  },
  rsvp: {
    willCome: 'Con sẽ đến',
    confirmed: 'Đã xác nhận ✓',
    headcount: 'Số người',
    wish: 'Lời chúc',
    thanks: 'Cảm ơn bạn! Hẹn gặp ở lễ.',
  },
  errors: {
    slugTaken: 'Đường dẫn này đã có người dùng',
    slugInvalid: 'Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang (3–40 ký tự)',
    slugReserved: 'Đường dẫn này được hệ thống dùng, chọn tên khác nhé',
    invalidInput: 'Dữ liệu không hợp lệ',
    notFound: 'Không tìm thấy',
    rateLimited: 'Bạn thao tác quá nhanh, thử lại sau một chút',
    server: 'Có lỗi xảy ra, thử lại sau nhé',
  },
} as const;

export type Dictionary = typeof vi;
