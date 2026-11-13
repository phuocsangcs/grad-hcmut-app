import Link from 'next/link';
import { facultiesFile, listFaculties } from '@/modules/content';

export const metadata = { title: 'Cẩm nang lễ tốt nghiệp Bách Khoa', description: 'Lịch theo khoa, bản đồ, mẹo, quán ăn quanh trường.' };

export default function GuidePage() {
  return (
    <main>
      <h1>Cẩm nang lễ tốt nghiệp</h1>
      <h2>Lịch theo khoa</h2>
      <p><small>{facultiesFile.source} · Cập nhật {facultiesFile.updatedAt}</small></p>
      <table>
        <thead><tr><th>Khoa</th><th>Ngày</th><th>Giờ</th><th>Nơi</th></tr></thead>
        <tbody>
          {listFaculties().map((f) => (
            <tr key={f.id}><td>{f.name}{f.note ? ` (${f.note})` : ''}</td><td>{f.date}</td><td>{f.time}</td><td>{f.venue ?? facultiesFile.defaultVenue}</td></tr>
          ))}
        </tbody>
      </table>
      <h2>Mẹo</h2>
      <ul>
        <li>Đến sớm 30–45 phút: bãi xe máy đông, chỗ ngồi trong A5 có hạn.</li>
        <li>Chụp ảnh ở bảng tên trường trước giờ lễ, tan lễ sẽ rất đông.</li>
        <li>Người lớn tuổi nên ngồi chờ ở căn tin hoặc ghế đá có bóng mát.</li>
        <li>Mạng trong trường hôm lễ rất chậm, tải trước bản đồ và lưu điểm hẹn.</li>
      </ul>
      <h2>Câu hỏi thường gặp</h2>
      <p><strong>Khách có cần vé không?</strong> Không, vào tự do nhưng chỗ ngồi trong hội trường ưu tiên tân cử nhân và người thân.</p>
      <p><strong>Ô tô đậu đâu?</strong> Trong trường rất hạn chế, nên thả khách ở cổng rồi đậu ngoài.</p>
      <ul>
        <li><Link href="/guide/map">Bản đồ trong trường</Link></li>
        <li><Link href="/eat">Ăn gì sau lễ</Link></li>
      </ul>
      <p><Link href="/create">Bạn sắp tốt nghiệp? Tạo thiệp</Link></p>
    </main>
  );
}
