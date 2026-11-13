import Link from 'next/link';
import { vi } from '@/lib/i18n';

export default function HomePage() {
  return (
    <main>
      <h1>{vi.app.name}</h1>
      <p>{vi.app.tagline}</p>
      <Link href="/create">Tạo thiệp</Link>
    </main>
  );
}
