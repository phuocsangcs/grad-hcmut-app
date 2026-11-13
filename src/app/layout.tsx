import type { Metadata } from 'next';
import { vi } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: vi.app.name,
  description: vi.app.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
