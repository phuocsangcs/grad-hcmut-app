# Giao diện (UI)

Mục tiêu: đổi diện mạo mà không chạm logic. Ba tầng, từ rộng đến hẹp:

```
src/ui/tokens.css        ← màu, chữ, bo góc, bóng (toàn site)
src/ui/primitives|layout ← Button, Field, Surface, Chip, Icon, PhoneFrame, Page, SiteHeader…
src/templates/<id>/      ← "lớp vỏ" của từng mẫu thiệp
```

Không dùng thư viện UI hay Tailwind: CSS Modules + biến CSS, chạy được ở mọi nơi, không thêm phụ thuộc.
Phông chữ tự host qua `@fontsource` (`src/ui/fonts.ts`), không gọi Google Fonts.

## 1. Đổi màu, chữ, bo góc

Sửa `src/ui/tokens.css`. Component chỉ dùng biến (`var(--bk-700)`, `var(--radius-m)`, `var(--shadow-1)`…),
không hard-code màu. Màu nhấn theo khoa nằm ở `src/content/faculties.json` (`accent`, `soft`) và được
gắn vào thiệp qua `--t-accent` / `--t-soft`.

## 2. Phong cách phẳng

Chỉ có một phong cách: phẳng. Không bóng đổ, không kính mờ, bo góc nhỏ, phân tách bằng viền mảnh
(`var(--line)`). Các biến `--shadow-*`, `--glass-*` vẫn còn trong `tokens.css` nhưng mang giá trị phẳng,
để component cũ không vỡ. Đừng thêm bóng/gradient trực tiếp trong component.

Ngoại lệ có chủ đích: `PhoneFrame` vẽ điện thoại thật (bo góc lớn, viền kim loại, đảo camera), vì nó
là ảnh minh hoạ thiết bị chứ không phải một bề mặt giao diện.

## 3. Thêm một mẫu thiệp

Mẫu chỉ lo bố cục và trang trí. Dữ liệu và hành vi (RSVP, đếm ngược, nút chỉ đường/lịch/gọi, điểm hẹn,
khám phá) được dựng sẵn thành `blocks` trong `InvitationCard`, mẫu chỉ việc đặt chúng vào chỗ.

1. Tạo `src/templates/<id>/<Id>Template.tsx` và `<id>.module.css`:

   ```tsx
   import type { TemplateProps } from '../types';
   import { facultyVars } from '../shared/vars';
   import { FacultyMotif } from '../motifs/FacultyMotif';
   import s from './<id>.module.css';

   export function MyTemplate({ card, faculty, blocks, message }: TemplateProps) {
     return (
       <article className={s.root} style={facultyVars(faculty)}>
         <FacultyMotif motif={faculty.motif} />
         <p>{card.greeting}</p>
         <h1>{faculty.degreeTitle}</h1>
         <h2>{card.displayName}</h2>
         {blocks.countdown}
         {blocks.ceremony}
         <p>{message}</p>
         {blocks.meeting}
         {blocks.rsvp}
         {blocks.after}
         {blocks.actions}
         {blocks.explore}
       </article>
     );
   }
   ```

2. Đăng ký trong `src/templates/registry.ts` (`{ id, scheme: 'light' | 'dark', Component }`).
3. Thêm mục vào `src/content/templates.json` (tên, mô tả, `ogImage`) — `pnpm content:check` sẽ báo nếu thiếu.
4. Xem thử ở `/playground?template=<id>`; wizard `/create` tự hiện mẫu mới kèm ảnh xem trước thật.

Ngày lễ (`mode = dayof`) mọi mẫu dùng chung `shared/DayOfView` để người lớn tuổi luôn thấy cùng một
giao diện chỉ dẫn rõ ràng. Muốn mẫu tự vẽ ngày lễ, sửa nhánh `dayof` trong `InvitationCard.tsx`.

### Trang mở thiệp (bìa tương tác)

Các mẫu bộ Sắc màu BK / Sáng tạo / Theo ngành dùng chung `shared/Gate.tsx`:

```tsx
<Gate cover={cover} duration={1800} exit="fade">{nội dung}</Gate>
```

- `cover` là bìa một màn hình (server render). Đặt `<GateButton>` để mở, hoặc trong client component
  gọi `useGate().open()` khi khách hoàn tất thao tác (cào, xé lịch, giữ nút…). Bìa cần thao tác thì thêm
  `<GateSkip>` ("Mở thiệp luôn") cho người lớn tuổi.
- Hiệu ứng riêng của mẫu viết bằng CSS `[data-gate-phase='opening'] .xxx { … }`; Gate lo phần bìa phủ
  nội dung và rời đi trong 600ms cuối (`exit`: `fade` | `up` | `zoom` | `none`).
- Nội dung đã render sẵn (ẩn) nên form RSVP, đếm ngược sẵn sàng ngay khi mở; giảm chuyển động thì mở ngay.
- `shared/sections.tsx` → `sectionList(blocks, labels)` trả danh sách mục chuẩn (ảnh, buổi lễ, RSVP, lưu bút,
  điểm hẹn, đường đến) để mẫu tự vẽ khung; `shared/date.ts` có `dateParts()` và các hàm tên ngắn.
- Ảnh khuôn viên cố định của mẫu nằm ở `shared/campus.ts` (`public/images/campus`, đã nén ~1600px).
- `collection` trong `templates.json` (`bk` | `creative` | `major` | `classic`) quyết định nhóm lọc ở `/templates`.

## 4. Hoạ tiết theo khoa

`src/templates/motifs/FacultyMotif.tsx` — mỗi `motif` là một SVG nét, màu lấy từ biến
`--m-ink`, `--m-accent`, `--m-paper`, `--m-sun` nên mẫu nào cũng tô lại được. Thêm hoạ tiết: thêm nhánh
mới, thêm tên vào `facultyMotifSchema` (`src/modules/content/schema.ts`), gán cho khoa trong JSON.

## 5. Quy ước

- Server Component mặc định; chỉ thêm `'use client'` cho phần có tương tác (form, đếm ngược, bản đồ).
- Client component **không** import `@/modules/card` (barrel kéo theo DB). Dùng `@/modules/card/mode`,
  `@/modules/card/greeting`, hoặc `import type`.
- Vùng chạm ≥ 44px, chữ thân bài 17px, tương phản AA — người dùng chính là ông bà, ba mẹ.
- Ảnh OG của mẫu: `public/images/og/<id>.png` (1200×630).
