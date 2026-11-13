import Link from 'next/link';
import { getOverview, listCardRsvps } from '@/modules/manage';
import { HttpError } from '@/lib/http';
import { formatDateVi, formatTimeVi } from '@/lib/time';

type Props = { params: Promise<{ token: string }> };

/** UI trần trang quản lý. Sẽ thay bằng UI thật. */
export default async function ManagePage({ params }: Props) {
  const { token } = await params;
  let data;
  try {
    data = await getOverview(token);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return (
        <main>
          <p>Link quản lý không đúng hoặc thiệp đã bị xoá.</p>
          <Link href="/create">Tạo thiệp mới</Link>
        </main>
      );
    }
    throw e;
  }
  const rsvps = await listCardRsvps(token);
  const { card, summary, urls } = data;

  return (
    <main>
      <h1>Quản lý thiệp của {card.displayName}</h1>
      <p>
        {formatDateVi(card.ceremonyAt)} · {formatTimeVi(card.ceremonyAt)} · {card.venue}
      </p>
      <p>
        Link thiệp: <a href={urls.card}>{urls.card}</a>
      </p>
      <p>
        <strong>{summary.guests} người sẽ đến</strong> · {summary.responses} phản hồi · {summary.wishes} lời chúc · {card.viewCount} lượt mở
      </p>
      <p>
        <Link href={`/manage/${token}/invites`}>Người nhận (gửi riêng từng người)</Link>
      </p>
      <h2>RSVP và lời chúc</h2>
      {rsvps.length === 0 ? (
        <p>Chưa có ai xác nhận.</p>
      ) : (
        <ul>
          {rsvps.map((r) => (
            <li key={r.id}>
              <strong>{r.guestName}</strong> · {r.headcount} người{r.groupKey ? ` · ${r.groupKey}` : ''}
              {r.wish ? <> — “{r.wish}”</> : null}
            </li>
          ))}
        </ul>
      )}
      <p>
        <small>Giữ link này riêng tư. Ai có link đều sửa hoặc xoá được thiệp.</small>
      </p>
    </main>
  );
}
