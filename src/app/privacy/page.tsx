export const metadata = { title: 'Quyền riêng tư' };

export default function PrivacyPage() {
  return (
    <main>
      <h1>Quyền riêng tư</h1>
      <ul>
        <li><strong>Không đăng nhập.</strong> Khách mở thiệp không cần tài khoản. Chúng tôi không theo dõi danh tính khách.</li>
        <li><strong>Thiệp tự xoá</strong> 30 ngày sau lễ, kéo theo toàn bộ RSVP và lời chúc.</li>
        <li><strong>Ai có link là xem được.</strong> Thiệp không bị Google index, nhưng đừng đăng link công khai nếu không muốn người lạ xem.</li>
        <li><strong>Dữ liệu lưu:</strong> tên hiển thị, khoa, lời nhắn, số điện thoại (nếu bạn nhập), email (nếu bạn nhập, chỉ để gửi lại link quản lý), tên và số người của khách RSVP. Không lưu IP thô, chỉ lưu dạng băm để chống spam.</li>
        <li><strong>Xoá ngay:</strong> vào link quản lý và bấm Xoá thiệp.</li>
      </ul>
    </main>
  );
}
