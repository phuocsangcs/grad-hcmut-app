import Link from 'next/link';

export const metadata = { title: 'Về dự án' };

export default function AboutPage() {
  return (
    <main>
      <h1>Về dự án</h1>
      <p>Dự án cá nhân, phi lợi nhuận, làm bởi một cựu sinh viên. <strong>Không phải sản phẩm chính thức của Trường Đại học Bách Khoa.</strong> Lịch lễ lấy từ thông báo công khai của trường, có thể thay đổi; hãy đối chiếu với thông báo chính thức.</p>
      <p>Nội dung bản đồ, quán ăn do cộng đồng góp. Thấy sai thì báo qua email ở chân trang.</p>
      <p>Nếu thấy hữu ích, bạn có thể mời một ly cà phê (QR donate sẽ đặt ở đây).</p>
      <p><Link href="/privacy">Quyền riêng tư</Link> · <Link href="/">Trang chủ</Link></p>
    </main>
  );
}
