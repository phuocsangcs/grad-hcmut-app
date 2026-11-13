import Link from 'next/link';
import { listPois, poisFile } from '@/modules/content';
import { directionsToCampusUrl } from '@/modules/share';

export const metadata = { title: 'Bản đồ trường Bách Khoa ngày lễ' };

/** SVG minh hoạ, toạ độ từ pois.json. UI thật sẽ có nền bản đồ và bottom sheet. */
export default function MapPage() {
  const { width, height } = poisFile.campus.mapSvg;
  const pois = listPois();
  return (
    <main>
      <h1>Bản đồ trong trường</h1>
      <p>{poisFile.campus.name} · {poisFile.campus.address} · <a href={directionsToCampusUrl()} target="_blank" rel="noreferrer">Chỉ đường đến cổng</a></p>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: 600, border: '1px solid #ccc' }} role="img" aria-label="Bản đồ trường">
        {pois.map((p) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={14} fill={p.type === 'hall' ? '#0f2a5f' : '#888'} />
            <text x={p.x + 18} y={p.y + 5} fontSize={22}>{p.name}</text>
          </g>
        ))}
      </svg>
      {Object.entries(poisFile.types).map(([type, label]) => {
        const items = pois.filter((p) => p.type === type);
        if (!items.length) return null;
        return (
          <section key={type}>
            <h2>{label}</h2>
            <ul>{items.map((p) => <li key={p.id}><strong>{p.name}</strong>{p.note ? ` — ${p.note}` : ''}</li>)}</ul>
          </section>
        );
      })}
      <p><small>Cập nhật {poisFile.updatedAt}</small> · <Link href="/guide">← Cẩm nang</Link></p>
    </main>
  );
}
