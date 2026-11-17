import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/config/site';
import { listMusic } from '@/modules/content';
import { Page, PageHeading, Prose, Surface } from '@/ui';
import { RecoverForm } from './recover-form';

export const metadata = { title: 'Về dự án' };

export default function AboutPage() {
  return (
    <Page width="narrow">
      <PageHeading title="Một món quà nhỏ cho ngày ra trường" lead="Dự án cá nhân, phi lợi nhuận, làm bởi một sinh viên Bách Khoa cho các bạn cùng khoá." />
      <Prose>
        <p><strong>Không phải sản phẩm chính thức của Trường Đại học Bách Khoa – ĐHQG-HCM.</strong> Tên trường và hình ảnh chỉ dùng để mô tả sự kiện. Lịch lễ lấy từ thông báo công khai của trường và có thể thay đổi; hãy đối chiếu với thông báo chính thức.</p>
        <p>
          Bản đồ và danh sách quán ăn do cộng đồng góp. Thấy sai, thiếu, hoặc muốn gỡ nội dung liên quan đến bạn,{' '}
          {site.contactEmail ? <>gửi email về <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</> : <>nhắn qua trang <Link href="/contact">Liên hệ</Link> hoặc bấm “Báo nội dung” ở cuối mỗi thiệp.</>}
        </p>

        <h2 id="recover">Lỡ mất link quản lý?</h2>
        <p>Nếu lúc tạo thiệp bạn có nhập email, nhập lại bên dưới để nhận link quản lý mới. Link cũ sẽ hết hiệu lực.</p>
      </Prose>
      <RecoverForm />

      <Prose>
        <h2 id="music">Nguồn nhạc nền</h2>
        <p>Nhạc nền trên thiệp đều có giấy phép dùng công khai:</p>
        <ul>
          {listMusic().map((m) => (
            <li key={m.id}>{m.license}</li>
          ))}
        </ul>

        <h2 id="donate">Mời dev ly cà phê</h2>
        <p>{site.donate.note}</p>
      </Prose>
      <Surface tone="tint" style={{ display: 'grid', placeItems: 'center', gap: 12, maxWidth: 340, textAlign: 'center' }}>
        {site.donate.qrImage ? (
          <>
            <Image
              src={site.donate.qrImage}
              alt="Mã VietQR chuyển khoản VietinBank để mời dev ly cà phê"
              width={site.donate.qrSize.width}
              height={site.donate.qrSize.height}
              sizes="260px"
              style={{ width: 260, height: 'auto', borderRadius: 12 }}
            />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>Mở app ngân hàng, quét mã để chuyển. Bao nhiêu cũng quý!</p>
          </>
        ) : (
          <p style={{ color: 'var(--fg-muted)' }}>Mã QR sẽ được cập nhật sớm.</p>
        )}
      </Surface>
    </Page>
  );
}
