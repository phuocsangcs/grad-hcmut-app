import Link from 'next/link';
import { Page, PageHeading, Prose } from '@/ui';

export const metadata = { title: 'Quyền riêng tư' };

export default function PrivacyPage() {
  return (
    <Page width="narrow">
      <PageHeading title="Dữ liệu của bạn và người thân" lead="Ngắn gọn: lưu ít nhất có thể, tự xoá sau lễ, không bán, không quảng cáo." />
      <Prose>
        <h2>Chúng tôi lưu gì</h2>
        <ul>
          <li><strong>Của người tạo thiệp:</strong> tên hiển thị, khoa, lời nhắn, điểm hẹn, số điện thoại (nếu nhập), email (nếu nhập, chỉ để gửi lại link quản lý).</li>
          <li><strong>Của khách:</strong> tên và số người khi bấm “sẽ đến”, lời chúc nếu có. Khách không cần đăng nhập.</li>
          <li><strong>Ghi nhận đồng ý điều khoản:</strong> khi xuất bản thiệp, lưu phiên bản điều khoản, thời điểm, IP dạng băm và loại trình duyệt. Xem lại trong trang quản lý.</li>
          <li><strong>Tin nhắn liên hệ:</strong> tên, cách liên lạc lại và nội dung bạn tự điền ở trang Liên hệ. Chỉ chủ dự án đọc được.</li>
          <li><strong>Chống spam:</strong> không lưu địa chỉ IP thô, chỉ lưu dạng băm một chiều.</li>
        </ul>

        <h2>Ai xem được</h2>
        <ul>
          <li>Ai có link thiệp thì xem được thiệp. Thiệp không được Google lập chỉ mục, nhưng đừng đăng link công khai nếu không muốn người lạ xem.</li>
          <li>Chỉ người có link quản lý mới thấy danh sách khách và lời chúc.</li>
        </ul>

        <h2>Khi nào bị xoá</h2>
        <ul>
          <li>Thiệp tự xoá <strong>30 ngày sau lễ</strong>, kéo theo toàn bộ RSVP, lời chúc và danh sách người nhận.</li>
          <li>Muốn xoá ngay: mở link quản lý, bấm <em>Xoá thiệp vĩnh viễn</em>.</li>
          <li>Bản ghi đồng ý điều khoản của thiệp đã xoá: chỉ còn phiên bản, thời điểm, IP băm, trình duyệt (không còn liên kết thiệp), tự xoá sau <strong>12 tháng</strong>.</li>
          <li>Tin nhắn liên hệ tự xoá sau <strong>180 ngày</strong>.</li>
        </ul>

        <h2>Không làm</h2>
        <ul>
          <li>Không bán hay chia sẻ dữ liệu, không quảng cáo, không dùng công cụ theo dõi của bên thứ ba.</li>
          <li>Phông chữ và ảnh được phục vụ từ chính máy chủ của dự án, không gọi Google Fonts.</li>
        </ul>
        <p>
          Xem thêm <Link href="/terms">Điều khoản sử dụng</Link>. Câu hỏi khác hoặc yêu cầu xoá dữ liệu: gửi qua trang <Link href="/contact">Liên hệ</Link>.
        </p>
      </Prose>
    </Page>
  );
}
