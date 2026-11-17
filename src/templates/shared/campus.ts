/**
 * Ảnh khuôn viên Bách Khoa (cơ sở Lý Thường Kiệt) dùng làm hình nền/minh hoạ cố định của mẫu.
 * Không phải ảnh người dùng tải lên. Nguồn gốc: thư mục hcmut-photos, đã nén ~1600px.
 */
export type CampusPhoto = { src: string; place: string; alt: string };

const P = (file: string, place: string, alt: string): CampusPhoto => ({ src: `/images/campus/${file}.jpg`, place, alt });

export const CAMPUS = {
  library: P('hanh-lang-thu-vien', 'Hành lang thư viện', 'Hành lang lát gạch dẫn vào thư viện, hai bên cột trắng'),
  basketball: P('san-bong-ro', 'Sân bóng rổ', 'Sân bóng rổ xanh dưới tán cây'),
  bench: P('ghe-da-hoa-vang', 'Ghế đá hoa vàng', 'Hàng ghế đá dưới tán cây, cỏ phủ hoa vàng'),
  b9: P('b9-nang-som', 'Toà B9 nắng sớm', 'Toà B9 sọc xanh trắng, nắng sớm xuyên qua hàng cây'),
  blossom: P('hoa-ken-hong', 'Hoa kèn hồng', 'Chùm hoa kèn hồng trên nền trời xanh'),
  field: P('san-banh', 'Sân banh', 'Sân cỏ rộng lúc hoàng hôn'),
  mechanical: P('duong-co-khi', 'Đường khu Cơ khí', 'Con đường rợp bóng cây dẫn vào xưởng Cơ khí'),
  sprinkler: P('tuoi-cay', 'Giờ tưới cây', 'Vòi nước tưới cây lấp lánh nắng chiều'),
  yellowPath: P('san-b2-hoa-vang', 'Sân B2 hoa vàng', 'Mặt sân phủ đầy hoa vàng rụng trước toà B2'),
  hall: P('hoa-truoc-giang-duong', 'Hoa trước giảng đường', 'Hoa vàng nở trước dãy giảng đường'),
  b10: P('duong-b10', 'Đường trước B10', 'Con đường vắng trước toà B10, lá rơi hai bên'),
} as const;
