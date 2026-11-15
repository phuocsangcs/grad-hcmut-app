import s from './extras.module.css';

/** Lưu bút: lời chúc khách để lại, chủ thiệp bật thì hiện công khai. */
export function Guestbook({ wishes }: { wishes: { id: string; name: string; wish: string }[] }) {
  if (wishes.length === 0) return null;
  return (
    <section className={s.guestbook} aria-label="Lời chúc">
      <h3>Lời chúc</h3>
      <ul>
        {wishes.map((w) => (
          <li key={w.id}>
            <p>{w.wish}</p>
            <b>{w.name}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Hết hạn xác nhận tham dự. */
export function RsvpClosed({ deadline }: { deadline: string | null }) {
  const d = deadline
    ? new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit' }).format(new Date(deadline))
    : null;
  return <p className={s.closed}>Đã hết hạn xác nhận tham dự{d ? ` (${d})` : ''}. Cần báo thêm thì liên hệ trực tiếp nhé.</p>;
}
