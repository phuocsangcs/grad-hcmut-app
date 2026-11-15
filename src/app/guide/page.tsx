import { facultiesFile, scheduleByDay } from '@/modules/content';
import { facultyVars } from '@/templates/shared/vars';
import { Button, Icon, Page, PageHeading, Surface, type IconName } from '@/ui';
import s from './guide.module.css';

export const metadata = { title: 'Cẩm nang lễ tốt nghiệp Bách Khoa', description: 'Lịch theo khoa, bản đồ, mẹo, quán ăn quanh trường.' };

const TIPS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'clock', title: 'Đến sớm 30–45 phút', body: 'Bãi xe máy đông, chỗ ngồi trong A5 có hạn.' },
  { icon: 'camera', title: 'Chụp ảnh trước giờ lễ', body: 'Bảng tên trường ở cổng chính rất đông sau khi tan lễ.' },
  { icon: 'tree', title: 'Người lớn tuổi ngồi chờ chỗ mát', body: 'Căn tin hoặc ghế đá hàng cây trước A5.' },
  { icon: 'warning', title: 'Mạng trong trường chậm', body: 'Mở sẵn thiệp và bản đồ trước khi vào, lưu điểm hẹn.' },
];

const FAQ = [
  { q: 'Khách có cần vé không?', a: 'Không. Vào tự do, nhưng chỗ ngồi trong hội trường ưu tiên tân khoa và người thân.' },
  { q: 'Ô tô đậu ở đâu?', a: 'Trong trường rất hạn chế. Nên thả khách ở cổng chính rồi đậu ngoài.' },
  { q: 'Lịch có thể thay đổi không?', a: 'Có. Lịch ở đây lấy theo thông báo của trường; luôn đối chiếu thông báo chính thức gần ngày lễ.' },
];

export default function GuidePage() {
  return (
    <Page>
      <PageHeading eyebrow="Cẩm nang" title="Lễ tốt nghiệp 26–29.11.2026" lead="Lịch từng khoa tại Hội trường A5, mẹo cho người nhà, bản đồ và quán ăn quanh trường." />

      <section aria-labelledby="h-schedule">
        <h2 id="h-schedule" className={s.h2}>Lịch theo khoa</h2>
        <div className={s.days}>
          {scheduleByDay().map((d) => (
            <div key={d.date} className={s.day}>
              <div className={s.dayHead}>
                <b>{d.date.slice(8, 10)}.{d.date.slice(5, 7)}</b>
                <span>{d.label.replace(/,.*$/, '')}</span>
              </div>
              <ul className={s.rows}>
                {d.items.map((f) => (
                  <li key={f.id} className={s.row} style={facultyVars(f)}>
                    <span className={s.time}>{f.time.replace(':', 'h')}</span>
                    <span className={s.name}>{f.name}<small>{f.venue}{f.note ? ` · ${f.note}` : ''}</small></span>
                    <span className={s.degree}>{f.degreeTitle}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={s.source} style={{ marginTop: 16 }}>{facultiesFile.source} · Cập nhật {facultiesFile.updatedAt}</p>
      </section>

      <section aria-labelledby="tips">
        <h2 id="tips" className={s.h2}>Mẹo cho người nhà</h2>
        <ul className={s.tips}>
          {TIPS.map((t) => (
            <li key={t.title} className={s.tip}>
              <span className={s.tipIcon}><Icon name={t.icon} size={20} /></span>
              <div><h3>{t.title}</h3><p>{t.body}</p></div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq">
        <h2 id="faq" className={s.h2}>Câu hỏi thường gặp</h2>
        <div className={s.faq}>
          {FAQ.map((f) => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
      </section>

      <Surface tone="tint">
        <div className={s.links}>
          <Button href="/guide/map" variant="secondary" leading={<Icon name="map" size={16} />}>Bản đồ trong trường</Button>
          <Button href="/eat" variant="secondary" leading={<Icon name="fork" size={16} />}>Ăn gì sau lễ</Button>
          <Button href="/create" trailing={<Icon name="arrow" size={16} />}>Sắp tốt nghiệp? Tạo thiệp</Button>
        </div>
      </Surface>
    </Page>
  );
}
