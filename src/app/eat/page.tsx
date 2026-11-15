import Link from 'next/link';
import { budgetSchema, eateriesFile, filterEateries } from '@/modules/content';
import { eaterySearchUrl } from '@/modules/share';
import { Button, Chip, Icon, Page, PageHeading } from '@/ui';
import s from './eat.module.css';

export const metadata = { title: 'Ăn gì sau lễ tốt nghiệp quanh Bách Khoa' };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

/** Lọc qua query string để SSR được, không cần JS: ?budget=mid&big=1&car=1 */
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
    <Page>
      <PageHeading eyebrow="Sau lễ" title="Ăn gì, ở đâu?" lead="Quán quanh trường cho cả nhà sau buổi lễ. Lọc theo túi tiền, nhóm đông, chỗ đậu ô tô." />

      <nav className={s.filters} aria-label="Bộ lọc">
        <Link href={link({ budget: undefined })} className={s.pill} aria-current={!budget}>Mọi mức giá</Link>
        {Object.entries(eateriesFile.budgets).map(([k, label]) => (
          <Link key={k} href={link({ budget: k })} className={s.pill} aria-current={budget === k}>{label}</Link>
        ))}
        <span className={s.sep} aria-hidden="true" />
        <Link href={link({ big: sp.big === '1' ? undefined : '1' })} className={s.pill} aria-current={sp.big === '1'}>
          <Icon name="users" size={14} /> Nhóm đông
        </Link>
        <Link href={link({ car: sp.car === '1' ? undefined : '1' })} className={s.pill} aria-current={sp.car === '1'}>
          <Icon name="parking" size={14} /> Đậu ô tô
        </Link>
      </nav>
      <p className={s.count} aria-live="polite">{list.length} quán · gần nhất trước</p>

      {list.length === 0 ? (
        <div className={s.empty}>Không có quán phù hợp. <Link href="/eat" style={{ color: 'var(--bk-600)', fontWeight: 700 }}>Bỏ bộ lọc</Link></div>
      ) : (
        <ul className={s.list}>
          {list.map((e) => (
            <li key={e.id}>
              <article className={s.item}>
                <div className={s.top}>
                  <h2>{e.name}</h2>
                  <span className={s.dist}>~{e.distanceMin} phút</span>
                </div>
                <div className={s.tags}>
                  <Chip tone="primary">{e.cuisine}</Chip>
                  <Chip tone="sun">{eateriesFile.budgets[e.budget]}</Chip>
                  {e.bigGroup && <Chip tone="leaf">Nhóm đông</Chip>}
                  {e.carParking && <Chip tone="outline">Đậu ô tô</Chip>}
                </div>
                <p className={s.addr}>{e.address}</p>
                {e.note ? <p className={s.note}>{e.note}</p> : <span style={{ flex: 1 }} />}
                <div>
                  <Button href={eaterySearchUrl(e)} target="_blank" rel="noreferrer" variant="secondary" size="sm" trailing={<Icon name="external" size={14} />}>Google Maps</Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
      <p className={s.small}>Cập nhật {eateriesFile.updatedAt}. Danh sách do cộng đồng góp, không phải quảng cáo. Thấy sai? Báo ở trang <Link href="/about">Về dự án</Link>.</p>
    </Page>
  );
}
