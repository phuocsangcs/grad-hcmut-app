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
  gate: P('cong-truong', 'Cổng trường', 'Cổng trường 268 Lý Thường Kiệt, cột biểu tượng xanh dưới hàng cây'),
  libraryFront: P('thu-vien-mat-tien', 'Thư viện', 'Mặt tiền toà thư viện trắng xanh, chữ Trường Đại học Bách Khoa'),
  libraryGold: P('thu-vien-hoa-vang', 'Thảm hoa vàng', 'Thảm hoa vàng rụng trước thư viện'),
  blossomA5: P('hoa-ken-san-a5', 'Hoa kèn sân A5', 'Cây hoa kèn hồng nở rộ trên bãi cỏ, hàng ghế trắng'),
  a5: P('san-a5', 'Sân A5', 'Sân trước Hội trường A5 và thư viện dưới tán cây'),
  pitch: P('san-bong', 'Sân bóng', 'Sân bóng cỏ xanh, khung thành trắng, trời nhiều mây'),
  goldenCampus: P('hoa-vang-san-truong', 'Mùa hoa vàng', 'Hoa vàng phủ sân trước dãy nhà kính xanh'),
} as const;
