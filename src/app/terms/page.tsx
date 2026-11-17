import Link from 'next/link';
import { TERMS_VERSION_LABEL } from '@/modules/legal/terms';
import { Page, PageHeading, Prose } from '@/ui';

export const metadata = { title: 'Điều khoản sử dụng', description: 'Điều khoản sử dụng và miễn trừ trách nhiệm của Ngày Ra Trường.' };

export default function TermsPage() {
  return (
    <Page width="narrow">
      <PageHeading title="Điều khoản sử dụng" lead={`Bản ngày ${TERMS_VERSION_LABEL}. Bấm “Đồng ý và xuất bản” khi tạo thiệp nghĩa là bạn chấp nhận các điều dưới đây.`} />
      <Prose>
        <h2>1. Dự án này là gì</h2>
        <p>
          Ngày Ra Trường là dự án cá nhân, phi lợi nhuận của một sinh viên, giúp tân cử nhân tạo thiệp mời lễ tốt nghiệp online.{' '}
          <strong>Đây không phải sản phẩm hay kênh chính thức của Trường Đại học Bách Khoa – ĐHQG-HCM.</strong> Tên trường, logo và hình ảnh chỉ dùng để mô tả sự kiện.
        </p>

        <h2>2. Miễn trừ trách nhiệm</h2>
        <ul>
          <li>Lịch lễ, giờ giấc và địa điểm lấy từ thông báo công khai của Trường và có thể thay đổi. Hãy luôn đối chiếu thông báo chính thức trước ngày lễ.</li>
          <li>Dịch vụ được cung cấp “nguyên trạng”, miễn phí, không cam kết luôn hoạt động liên tục. Dự án không chịu trách nhiệm cho thiệt hại phát sinh do lỗi kỹ thuật, mất dữ liệu hay thông tin lịch lễ sai lệch.</li>
          <li>Bản đồ và danh sách quán ăn do cộng đồng góp, chỉ mang tính tham khảo.</li>
        </ul>

        <h2>3. Trách nhiệm của người tạo thiệp</h2>
        <ul>
          <li>Bạn chịu trách nhiệm về toàn bộ nội dung đưa lên thiệp: tên, lời nhắn, số điện thoại, ảnh.</li>
          <li>Chỉ dùng ảnh của chính bạn hoặc ảnh đã được người trong ảnh cho phép. Không đăng nội dung xúc phạm, mạo danh, vi phạm pháp luật hoặc quyền của người khác.</li>
          <li>Không dùng dịch vụ để gửi thư rác, lừa đảo hay thu thập thông tin của khách.</li>
        </ul>

        <h2>4. Link thiệp và link quản lý</h2>
        <ul>
          <li>Ai có link thiệp đều xem được thiệp. Thiệp không được Google lập chỉ mục, nhưng đừng đăng link công khai nếu không muốn người lạ xem.</li>
          <li>Ai có link quản lý đều sửa, xoá được thiệp và xem danh sách khách. Bạn có trách nhiệm giữ link này riêng tư. Lỡ mất thì lấy lại bằng email (nếu đã nhập) ở trang <Link href="/about#recover">Về dự án</Link>.</li>
        </ul>

        <h2>5. Dữ liệu và quyền riêng tư</h2>
        <p>
          Cách dự án thu thập, dùng và xoá dữ liệu của bạn và khách được mô tả ở <Link href="/privacy">Chính sách quyền riêng tư</Link>. Tóm tắt: lưu ít nhất có thể, thiệp tự xoá 30 ngày sau lễ,
          không bán dữ liệu, không quảng cáo, không gắn công cụ theo dõi của bên thứ ba.
        </p>

        <h2>6. Ghi nhận việc đồng ý</h2>
        <p>
          Khi bạn bấm “Đồng ý và xuất bản”, hệ thống ghi lại phiên bản điều khoản, thời điểm đồng ý, địa chỉ IP dạng băm một chiều (không lưu IP thô) và loại trình duyệt, gắn với thiệp vừa tạo.
          Bạn xem lại được thông tin này trong trang quản lý. Khi thiệp bị xoá, bản ghi chỉ còn các thông tin trên (không còn liên kết với thiệp) và tự xoá sau 12 tháng.
        </p>

        <h2>7. Gỡ nội dung và khoá thiệp</h2>
        <p>
          Thiệp vi phạm điều 3 có thể bị khoá hoặc xoá mà không cần báo trước. Thiệp bị nhiều người báo cáo sẽ tự khoá chờ xem xét. Muốn yêu cầu gỡ nội dung liên quan đến bạn, dùng nút “Báo nội dung”
          ở cuối thiệp hoặc trang <Link href="/contact">Liên hệ</Link>.
        </p>

        <h2>8. Thay đổi điều khoản</h2>
        <p>
          Điều khoản có thể được cập nhật. Bản mới có ngày hiệu lực mới ở đầu trang; những thiệp đã tạo trước đó vẫn theo bản đã đồng ý cho đến khi thiệp tự xoá.
        </p>

        <h2>9. Liên hệ</h2>
        <p>
          Câu hỏi về điều khoản hay dữ liệu của bạn: gửi qua trang <Link href="/contact">Liên hệ</Link>.
        </p>
      </Prose>
    </Page>
  );
}
