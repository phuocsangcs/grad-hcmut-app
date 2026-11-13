import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <p>Trang này không tồn tại.</p>
      <Link href="/create">Tạo thiệp tốt nghiệp</Link>
    </main>
  );
}
