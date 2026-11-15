import type { Metadata, Viewport } from 'next';
import { vi } from '@/lib/i18n';
import '@/ui/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Ngày Ra Trường – Thiệp mời lễ tốt nghiệp Bách Khoa', template: '%s · Ngày Ra Trường' },
  description: vi.app.tagline,
};

export const viewport: Viewport = {
  themeColor: '#032B91',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Extension trình duyệt hay gắn class/attribute lên <html> trước khi React hydrate.
    // Chỉ bỏ qua khác biệt thuộc tính của riêng thẻ này, không ảnh hưởng thẻ con.
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
