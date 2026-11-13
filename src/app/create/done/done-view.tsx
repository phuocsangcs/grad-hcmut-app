'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

type Created = { slug: string; url: string; manageToken: string; manageUrl: string };

export function DoneView({ groups }: { groups: { key: string; label: string }[] }) {
  // Đọc từ sessionStorage sau hydrate; server render null.
  const c = useSyncExternalStore(
    () => () => {},
    (): Created | null => { try { const raw = sessionStorage.getItem('grad.created'); return raw ? JSON.parse(raw) : null; } catch { return null; } },
    () => null,
  );
  if (!c) return <main><p>Không có thiệp vừa tạo.</p><Link href="/create">Tạo thiệp</Link></main>;

  const copy = (s: string) => navigator.clipboard?.writeText(s);
  const share = async (url: string) => {
    if (navigator.share) await navigator.share({ url }).catch(() => {});
    else copy(url);
  };
  return (
    <main>
      <h1>Xong! Thiệp của bạn đã sẵn sàng</h1>
      <p>Link thiệp: <a href={c.url}>{c.url}</a> <button onClick={() => copy(c.url)}>Copy</button> <button onClick={() => share(c.url)}>Gửi Zalo / Messenger</button></p>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR sinh động từ API */}
      <p><img src={`/api/cards/${c.slug}/qr?size=256`} alt="QR" width={256} height={256} /></p>
      <h2>Gửi nhanh theo nhóm</h2>
      <ul>
        {groups.map((g) => {
          const u = `${c.url}?to=${g.key}`;
          return <li key={g.key}>{g.label}: <a href={u}>{u}</a> <button onClick={() => share(u)}>Gửi</button></li>;
        })}
      </ul>
      <h2>Link quản lý — LƯU LẠI</h2>
      <p><a href={c.manageUrl}>{c.manageUrl}</a> <button onClick={() => copy(c.manageUrl)}>Copy</button></p>
      <p><strong>Cảnh báo:</strong> link này chỉ hiện một lần. Mất link thì chỉ lấy lại được nếu bạn đã nhập email.</p>
      <p><Link href={`/manage/${c.manageToken}/invites`}>Thêm người nhận để gửi riêng từng người →</Link></p>
    </main>
  );
}
