'use client';

import { useSyncExternalStore } from 'react';
import { Button, CopyButton, Icon, Page, PageHeading, ShareButton, Surface } from '@/ui';
import s from './done.module.css';

type Created = { slug: string; url: string; manageToken: string; manageUrl: string };

const noop = () => () => {};
// getSnapshot phải trả về cùng tham chiếu khi dữ liệu không đổi -> cache theo chuỗi raw.
let cachedRaw: string | null = null;
let cachedValue: Created | null = null;
function readCreated(): Created | null {
  try {
    const raw = sessionStorage.getItem('grad.created');
    if (raw !== cachedRaw) { cachedRaw = raw; cachedValue = raw ? JSON.parse(raw) : null; }
    return cachedValue;
  } catch { return null; }
}

/** Trang sau khi tạo: link, QR, gửi nhanh theo nhóm, link quản lý (hiện một lần). */
export function DoneView({ groups }: { groups: { key: string; label: string }[] }) {
  // Đọc từ sessionStorage sau hydrate; server render null.
  const c = useSyncExternalStore(noop, readCreated, () => null);
  if (!c) {
    return (
      <Page width="narrow">
        <PageHeading title="Không có thiệp vừa tạo" lead="Trang này chỉ hiện ngay sau khi bạn tạo thiệp." />
        <div><Button href="/create" trailing={<Icon name="arrow" size={16} />}>Tạo thiệp</Button></div>
      </Page>
    );
  }

  return (
    <Page>
      <div className={s.wrap}>
        <div className={s.col}>
          <header className={s.hero}>
            <p className="eyebrow">Xong rồi</p>
            <h1>Thiệp của bạn <em>đã sẵn sàng</em></h1>
            <p className={s.lead}>Gửi link cho mọi người. Thiệp tự đếm ngược, tự đổi sang chỉ dẫn trong ngày lễ.</p>
          </header>

          <Surface>
            <div className={s.link}>
              <a className={s.url} href={c.url} target="_blank" rel="noreferrer">{c.url}</a>
              <div className={s.actions}>
                <CopyButton text={c.url} />
                <ShareButton url={c.url} title="Thiệp mời lễ tốt nghiệp" />
              </div>
            </div>
          </Surface>

          <div>
            <h2 className={s.h2}>Gửi nhanh theo nhóm</h2>
            <p className={s.lead}>Mỗi link mở đầu bằng lời chào riêng cho nhóm đó.</p>
          </div>
          <ul className={s.groupList}>
            {groups.map((g) => {
              const u = `${c.url}?to=${g.key}`;
              return (
                <li key={g.key} className={s.groupRow}>
                  <span><strong>{g.label}</strong><small>?to={g.key}</small></span>
                  <span className={s.groupBtns}>
                    <CopyButton text={u} size="sm" label="Chép" />
                    <ShareButton url={u} size="sm" label="Gửi" />
                  </span>
                </li>
              );
            })}
          </ul>

          <Surface className={s.manage}>
            <h2><Icon name="lock" size={18} /> Link quản lý — lưu lại ngay</h2>
            <p style={{ marginTop: 6 }}>Dùng để sửa thiệp, xem ai sẽ đến và thêm người nhận. <strong>Chỉ hiện một lần.</strong> Mất link thì chỉ lấy lại được nếu bạn đã nhập email.</p>
            <div className={s.link} style={{ marginTop: 12 }}>
              <a className={s.url} href={c.manageUrl}>{c.manageUrl}</a>
              <CopyButton text={c.manageUrl} variant="primary" />
            </div>
          </Surface>

          <div className={s.actions}>
            <Button href={`/manage/${c.manageToken}/invites`} variant="secondary" trailing={<Icon name="arrow" size={16} />}>Thêm người nhận để gửi riêng từng người</Button>
            <Button href={`/manage/${c.manageToken}`} variant="ghost">Mở trang quản lý</Button>
          </div>
        </div>

        <Surface className={s.qrCard} as="aside">
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR sinh động từ API */}
          <img src={`/api/cards/${c.slug}/qr?size=440`} alt={`Mã QR mở thiệp /${c.slug}`} />
          <strong>Quét để mở thiệp</strong>
          <p className={s.lead}>In ra kẹp vào hoa, hoặc gửi ảnh QR cho ông bà.</p>
          <Button href={`/api/cards/${c.slug}/qr?size=1024`} variant="secondary" size="sm" download leading={<Icon name="download" size={16} />}>Tải QR</Button>
        </Surface>
      </div>
    </Page>
  );
}
