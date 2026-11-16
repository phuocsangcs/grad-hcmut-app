/**
 * Mặt bằng khuôn viên cơ sở Lý Thường Kiệt, vẽ lại từ sơ đồ chính thức của Trường
 * (hcmut-photos/ban do*.{jpg,png}). Hệ toạ độ "nhìn từ trên xuống": x sang phải (Đông), y xuống dưới (Nam).
 * Minh hoạ, không đúng tỉ lệ thật. Đơn vị tuỳ ý, khuôn viên nằm trong khoảng 1000 × 600.
 *
 * Sửa bản đồ: chỉ cần đổi số ở đây (vị trí, kích thước, số tầng), phần vẽ 3D tự tính.
 */

/** Một khối hộp: góc trên-trái (x, y), rộng w (Đông–Tây), sâu d (Bắc–Nam), số tầng. */
export type Box = { x: number; y: number; w: number; d: number; floors: number };

export type BuildingKind = 'hall' | 'faculty' | 'office' | 'lab' | 'glass';

export type Building = {
  id: string;
  /** Chữ in trên nóc: A5, B1, C4… */
  code: string;
  /** Tên đầy đủ; trống thì chỉ hiện mã (toà phụ). */
  name?: string;
  kind: BuildingKind;
  /** Khoa đặt tại toà này (id trong faculties.json). */
  facultyIds?: string[];
  boxes: Box[];
  note?: string;
};

export type Flat = { x: number; y: number; w: number; d: number; kind: 'green' | 'field' | 'court' | 'lot' | 'plaza' };

/** Ranh giới khuôn viên (đa giác, theo chiều kim đồng hồ). Cạnh trái là đường Lý Thường Kiệt, cạnh dưới là Tô Hiến Thành. */
export const CAMPUS: [number, number][] = [
  [60, 600],
  [238, 160],
  [420, 128],
  [424, 70],
  [770, 22],
  [905, 4],
  [996, 70],
  [996, 600],
];

export const STREETS: { name: string; poly: [number, number][]; label: { x: number; y: number; angle: number } }[] = [
  {
    name: 'ĐƯỜNG LÝ THƯỜNG KIỆT',
    poly: [
      [42, 628],
      [228, 140],
      [196, 128],
      [10, 616],
    ],
    label: { x: 118, y: 372, angle: -69 },
  },
  {
    name: 'ĐƯỜNG TÔ HIẾN THÀNH',
    poly: [
      [10, 616],
      [1030, 616],
      [1030, 648],
      [-20, 648],
    ],
    label: { x: 400, y: 632, angle: 0 },
  },
];

export const ENTRANCES = [
  // x, y: vị trí cổng trên ranh giới; sign: chỗ đặt biển tên (ngoài mặt đường cho khỏi đè ghim).
  { id: 'gate-1', label: 'Cổng 1', street: 'Lý Thường Kiệt', x: 164, y: 345, sign: [128, 330], poi: 'gate-main' },
  { id: 'gate-2', label: 'Cổng 2', street: 'Tô Hiến Thành', x: 640, y: 600, sign: [640, 640], poi: 'gate-tbt' },
  { id: 'gate-3', label: 'Cổng 3', street: 'Tô Hiến Thành', x: 935, y: 600, sign: [935, 640], poi: undefined },
] as const;

export const FLATS: Flat[] = [
  { kind: 'field', x: 270, y: 300, w: 160, d: 85 },
  { kind: 'court', x: 478, y: 180, w: 40, d: 38 },
  { kind: 'court', x: 600, y: 168, w: 130, d: 62 },
  { kind: 'lot', x: 655, y: 505, w: 120, d: 58 },
  { kind: 'plaza', x: 912, y: 382, w: 78, d: 122 },
  { kind: 'green', x: 185, y: 300, w: 68, d: 62 },
  { kind: 'green', x: 345, y: 226, w: 85, d: 52 },
  { kind: 'green', x: 330, y: 505, w: 140, d: 44 },
  { kind: 'green', x: 620, y: 234, w: 100, d: 16 },
  { kind: 'green', x: 830, y: 232, w: 115, d: 34 },
  { kind: 'green', x: 845, y: 136, w: 110, d: 10 },
  { kind: 'green', x: 650, y: 330, w: 150, d: 14 },
  { kind: 'green', x: 448, y: 210, w: 26, d: 26 },
];

/** Cây rời (vẽ tròn có bóng), toạ độ gốc cây. */
export const TREES: [number, number][] = [
  [196, 312], [214, 330], [236, 312], [228, 350], [200, 352],
  [356, 240], [380, 236], [404, 244], [366, 266], [392, 268], [418, 262],
  [342, 516], [366, 530], [392, 516], [418, 530], [444, 516], [462, 536],
  [630, 242], [660, 240], [690, 244], [712, 240],
  [842, 244], [866, 256], [890, 244], [916, 256], [936, 244],
  [658, 336], [690, 338], [722, 336], [756, 338], [790, 336],
  [922, 394], [980, 394], [922, 492], [980, 492], [951, 414], [951, 472],
  [455, 218], [468, 230],
  [610, 380], [620, 450], [430, 410],
];

export const BUILDINGS: Building[] = [
  {
    id: 'a5', code: 'A5', name: 'Hội trường A5', kind: 'hall',
    boxes: [{ x: 440, y: 240, w: 58, d: 52, floors: 3 }],
    note: 'Nơi tổ chức lễ tốt nghiệp. Phòng Đối ngoại, Trung tâm Máy tính cũng ở toà này.',
  },
  { id: 'a4', code: 'A4', name: 'Hội trường A4 · Văn phòng Chương trình Quốc tế', kind: 'glass', boxes: [{ x: 508, y: 222, w: 55, d: 62, floors: 6 }] },
  { id: 'a2', code: 'A2', name: 'Thư viện', kind: 'office', boxes: [{ x: 535, y: 330, w: 70, d: 75, floors: 4 }] },
  { id: 'a1', code: 'A1', name: 'Nhà Hành chính', kind: 'office', boxes: [{ x: 490, y: 425, w: 125, d: 45, floors: 3 }] },
  { id: 'a3', code: 'A3', name: 'Khoa Khoa học và Kỹ thuật Máy tính', kind: 'faculty', facultyIds: ['cse'], boxes: [{ x: 720, y: 395, w: 180, d: 85, floors: 3 }] },
  { id: 'kiosk', code: 'OISP', name: 'Kiosk OISP · Văn phòng Đào tạo Quốc tế', kind: 'glass', facultyIds: ['oisp'], boxes: [{ x: 480, y: 505, w: 150, d: 55, floors: 2 }] },
  { id: 'b1', code: 'B1', name: 'Khoa Điện – Điện tử', kind: 'faculty', facultyIds: ['eee'], boxes: [{ x: 258, y: 420, w: 46, d: 145, floors: 6 }] },
  { id: 'b1a', code: 'B1A', kind: 'office', boxes: [{ x: 205, y: 430, w: 40, d: 135, floors: 4 }] },
  { id: 'b2', code: 'B2', name: 'Khoa Kỹ thuật Hoá học', kind: 'faculty', facultyIds: ['che'], boxes: [{ x: 320, y: 452, w: 150, d: 44, floors: 4 }, { x: 320, y: 405, w: 38, d: 47, floors: 4 }] },
  { id: 'b3', code: 'B3', name: 'Phòng Đào tạo Sau đại học', kind: 'faculty', facultyIds: ['grad'], boxes: [{ x: 215, y: 262, w: 120, d: 34, floors: 3 }, { x: 218, y: 228, w: 32, d: 34, floors: 3 }] },
  { id: 'b4', code: 'B4', name: 'Khoa Khoa học Ứng dụng', kind: 'faculty', facultyIds: ['fas'], boxes: [{ x: 300, y: 160, w: 135, d: 60, floors: 4 }] },
  { id: 'b6', code: 'B6', name: 'Khoa Kỹ thuật Xây dựng', kind: 'faculty', facultyIds: ['ce'], boxes: [{ x: 445, y: 135, w: 80, d: 38, floors: 3 }] },
  { id: 'b7', code: 'B7', kind: 'office', boxes: [{ x: 968, y: 175, w: 24, d: 80, floors: 4 }] },
  { id: 'b8', code: 'B8', name: 'Khoa Kỹ thuật Địa chất và Dầu khí', kind: 'faculty', facultyIds: ['ges'], boxes: [{ x: 640, y: 255, w: 175, d: 32, floors: 3 }] },
  { id: 'b9', code: 'B9', name: 'Khoa Môi trường và Tài nguyên', kind: 'faculty', facultyIds: ['env'], boxes: [{ x: 640, y: 287, w: 175, d: 38, floors: 3 }] },
  { id: 'b10', code: 'B10', name: 'Khoa Quản lý Công nghiệp', kind: 'faculty', facultyIds: ['im'], boxes: [{ x: 840, y: 285, w: 110, d: 38, floors: 3 }] },
  { id: 'b11', code: 'B11', name: 'Khoa Cơ khí', kind: 'faculty', facultyIds: ['me'], boxes: [{ x: 745, y: 172, w: 32, d: 50, floors: 3 }] },
  { id: 'b12', code: 'B12', kind: 'office', boxes: [{ x: 745, y: 138, w: 32, d: 28, floors: 2 }] },
  { id: 'c1', code: 'C1', kind: 'office', boxes: [{ x: 440, y: 85, w: 320, d: 32, floors: 2 }] },
  { id: 'c2', code: 'C2', kind: 'lab', boxes: [{ x: 790, y: 186, w: 170, d: 36, floors: 2 }] },
  { id: 'c3', code: 'C3', kind: 'lab', boxes: [{ x: 790, y: 150, w: 170, d: 28, floors: 2 }] },
  { id: 'c4', code: 'C4', name: 'Khoa Công nghệ Vật liệu', kind: 'faculty', facultyIds: ['mt'], boxes: [{ x: 845, y: 84, w: 120, d: 48, floors: 6 }] },
  { id: 'c5', code: 'C5', name: 'Khoa Kỹ thuật Giao thông', kind: 'faculty', facultyIds: ['te'], boxes: [{ x: 845, y: 60, w: 110, d: 22, floors: 4 }] },
  { id: 'c6', code: 'C6', name: 'Phòng thí nghiệm trọng điểm · Trung tâm Ngoại ngữ', kind: 'lab', boxes: [{ x: 845, y: 40, w: 96, d: 18, floors: 3 }] },
  { id: 'n1', code: '1', kind: 'lab', boxes: [{ x: 120, y: 490, w: 38, d: 80, floors: 2 }] },
  { id: 'n2', code: '2', kind: 'lab', boxes: [{ x: 150, y: 420, w: 36, d: 55, floors: 2 }] },
  { id: 'n3', code: '3', kind: 'lab', boxes: [{ x: 820, y: 45, w: 22, d: 45, floors: 2 }] },
  { id: 'n4', code: '4', kind: 'lab', boxes: [{ x: 915, y: 22, w: 26, d: 16, floors: 2 }] },
  { id: 'n5', code: '5', kind: 'lab', boxes: [{ x: 525, y: 135, w: 32, d: 38, floors: 3 }] },
  { id: 'n6', code: '6', kind: 'lab', boxes: [{ x: 765, y: 88, w: 28, d: 30, floors: 2 }] },
  { id: 'n7', code: '7', kind: 'lab', boxes: [{ x: 952, y: 285, w: 38, d: 38, floors: 3 }] },
  { id: 'n8', code: '8', kind: 'lab', boxes: [{ x: 968, y: 110, w: 22, d: 32, floors: 2 }] },
  { id: 'n9', code: '9', kind: 'lab', boxes: [{ x: 238, y: 195, w: 30, d: 26, floors: 2 }] },
  { id: 'n10', code: '10', kind: 'lab', boxes: [{ x: 682, y: 48, w: 34, d: 30, floors: 2 }] },
];
