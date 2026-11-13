import Link from 'next/link';
import { budgetSchema, eateriesFile, filterEateries } from '@/modules/content';
import { eaterySearchUrl } from '@/modules/share';

export const metadata = { title: 'Ăn gì sau lễ tốt nghiệp quanh Bách Khoa' };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

/** Lọc qua query string để SSR được: ?budget=mid&big=1&car=1 */
export default async function EatPage({ searchParams }: Props) {
  const sp = await searchParams;
  const budget = budgetSchema.safeParse(sp.budget).data;
  const list = filterEateries({ budget, bigGroup: sp.big === '1', carParking: sp.car === '1' });
  const link = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { budget: sp.budget, big: sp.big, car: sp.car, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    return `/eat${q.size ? `?${q}` : ''}`;
  };
  return (
    <main>
      <h1>Ăn gì sau lễ</h1>
      <p>
        Ngân sách: <Link href={link({ budget: undefined })}>Tất cả</Link>
        {Object.entries(eateriesFile.budgets).map(([k, label]) => <> · <Link key={k} href={link({ budget: k })}>{label}</Link></>)}
      </p>
      <p>
        <Link href={link({ big: sp.big === '1' ? undefined : '1' })}>{sp.big === '1' ? '☑' : '☐'} Nhóm đông</Link> ·{' '}
        <Link href={link({ car: sp.car === '1' ? undefined : '1' })}>{sp.car === '1' ? '☑' : '☐'} Có chỗ đậu ô tô</Link>
      </p>
      {list.length === 0 ? <p>Không có quán phù hợp, thử bỏ bớt điều kiện lọc.</p> : (
        <ul>
          {list.map((e) => (
            <li key={e.id}>
              <strong>{e.name}</strong> · {e.cuisine} · {eateriesFile.budgets[e.budget]} · ~{e.distanceMin} phút
              {e.bigGroup && ' · nhóm đông'}{e.carParking && ' · đậu ô tô'}
              <br />{e.address}{e.note ? ` — ${e.note}` : ''}
              <br /><a href={eaterySearchUrl(e)} target="_blank" rel="noreferrer">Mở Google Maps</a>
            </li>
          ))}
        </ul>
      )}
      <p><small>Cập nhật {eateriesFile.updatedAt}. Danh sách do cộng đồng góp, không phải quảng cáo.</small></p>
      <p><Link href="/guide">← Cẩm nang</Link></p>
    </main>
  );
}
