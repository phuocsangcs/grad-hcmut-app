import { facultiesFile } from '@/modules/content';
import { OFFICIAL_NOTICE_URL, ScheduleList } from '@/components/schedule/ScheduleList';
import { NOTICE_NOTES, PROGRAMS } from './program';
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
      <PageHeading title="Lễ tốt nghiệp 26–29.11.2026" lead="Lịch từng khoa tại Hội trường A5, mẹo cho người nhà, bản đồ và quán ăn quanh trường." />

      <section aria-labelledby="h-schedule" className={s.schedule}>
        <header className={s.scheduleHead}>
          <h2 id="h-schedule" className={s.h2}>Lịch theo khoa</h2>
          <p className={s.source}>Tất cả tổ chức tại Hội trường A5. Lịch lấy theo thông báo của Trường, cập nhật {facultiesFile.updatedAt}.</p>
          <a className={s.official} href={OFFICIAL_NOTICE_URL} target="_blank" rel="noopener noreferrer">
            <Icon name="external" size={16} />
            Xem thông báo chính thức trên hcmut.edu.vn
          </a>
        </header>
        <div className={s.scheduleBody}>
          <ScheduleList />

          <div className={s.programs}>
            <p className={s.programsHead}>Chương trình chi tiết từng buổi lễ</p>
            {PROGRAMS.map((p) => (
              <details key={p.id} className={s.program}>
                <summary>
                  <span className={s.programTitle}>{p.title}</span>
                  <span className={s.programWhen}>{p.when}</span>
                  <Icon name="chevron" size={18} className={s.chev} />
                </summary>
                <div className={s.programBody}>
                  <p className={s.programMeta}>
                    <b>Địa điểm:</b> {p.venue}. <b>Tham dự:</b> {p.attendees}
                  </p>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th scope="col">Thời gian</th>
                        <th scope="col">Sự kiện</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.rows.map((r) => (
                        <tr key={r.time}>
                          <td>{r.time}</td>
                          <td>{r.event}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className={s.source}>Chương trình dự kiến, theo thông báo của Trường.</p>
                </div>
              </details>
            ))}
            <details className={s.program}>
              <summary>
                <span className={s.programTitle}>Lưu ý quan trọng từ Trường</span>
                <span className={s.programWhen}>Thư mời, lễ phục, chỗ ngồi, ảnh lễ</span>
                <Icon name="chevron" size={18} className={s.chev} />
              </summary>
              <div className={s.programBody}>
                <ol className={s.notes}>
                  {NOTICE_NOTES.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ol>
              </div>
            </details>
          </div>
        </div>
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
          <Button href="/templates" trailing={<Icon name="arrow" size={16} />}>Sắp tốt nghiệp? Tạo thiệp</Button>
        </div>
      </Surface>
    </Page>
  );
}
