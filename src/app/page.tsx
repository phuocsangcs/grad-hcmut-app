import Link from 'next/link';
import { vi } from '@/lib/i18n';
import { listTemplates } from '@/modules/content';

export default function HomePage() {
  return (
    <main>
      <h1>{vi.app.name}</h1>
      <p>{vi.app.tagline}</p>
      <p><Link href="/create">Tạo thiệp</Link> · <Link href="/guide">Cẩm nang lễ</Link></p>
      <h2>Mẫu thiệp</h2>
      <ul>{listTemplates().map((t) => <li key={t.id}>{t.name} — {t.description}</li>)}</ul>
      <h2>Cam kết</h2>
      <ul>
        <li>Khách không cần đăng nhập</li>
        <li>Thiệp tự xoá 30 ngày sau lễ</li>
        <li>Không bán dữ liệu, không quảng cáo</li>
      </ul>
      <footer><Link href="/privacy">Quyền riêng tư</Link> · <Link href="/about">Về dự án</Link></footer>
    </main>
  );
}
