import Link from 'next/link';
import { LogoMark } from '../primitives/Logo';
import s from './SiteFooter.module.css';

/** Chân trang: disclaimer dự án sinh viên, nguồn ảnh, link chính sách, mời cà phê. */
export function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={`container ${s.inner}`}>
        <div className={s.brand}>
          <LogoMark light size={24} />
          <span>
            <b>Ngày Ra Trường</b> · Dự án của sinh viên, không phải kênh chính thức của Trường ĐH Bách Khoa – ĐHQG-HCM.
          </span>
        </div>
        <nav className={s.links} aria-label="Chân trang">
          <Link href="/guide">Cẩm nang</Link>
          <Link href="/privacy">Quyền riêng tư</Link>
          <Link href="/terms">Điều khoản</Link>
          <Link href="/about">Về dự án</Link>
          <Link href="/contact">Liên hệ</Link>
          <Link href="/about#donate" className={s.coffee}>
            Mời dev ly cà phê
          </Link>
        </nav>
        <p className={s.credit}>Ảnh: Trường ĐH Bách Khoa, Kỷ Yếu Sài Gòn. Lịch lễ theo thông báo của Trường, vui lòng đối chiếu nguồn chính thức.</p>
      </div>
    </footer>
  );
}
