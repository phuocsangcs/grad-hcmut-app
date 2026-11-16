import Image from 'next/image';
import Link from 'next/link';
import { countdown } from '@/modules/card/mode';
import { listTemplates, nextCeremony, scheduleByDay } from '@/modules/content';
import { formatTimeVi } from '@/lib/time';
import { Countdown } from '@/templates/shared/Countdown';
import { InvitationCard, SAMPLE_LINKS, sampleCard } from '@/templates';
import { Button, Icon, PhoneFrame, SiteFooter, SiteHeader, type IconName } from '@/ui';
import { ParallaxLayer } from './parallax-layer';
import { LiveCountdown } from './live-countdown';
import { TemplateCarousel } from './template-carousel';
import { sampleOptionsFor } from './templates/samples';
import s from './home.module.css';

export const revalidate = 3600;

/**
 * Hai thiệp hiện trên điện thoại ở hero.
 *  - scale: KÍCH THƯỚC điện thoại (1 = 390×780px). Chỉnh số này để to/nhỏ.
 *  - speed: độ trôi khi cuộn trang (px dịch lên cho mỗi 1px cuộn). Điện thoại trước trôi nhiều hơn.
 *  - max:   quãng trôi tối đa (px).
 */
const HERO = [
  { templateId: 'riso', facultyId: 'me', displayName: 'Lê Quốc Bảo', scale: 0.4, speed: 0.1, max: 50 },
  { templateId: 'print', facultyId: 'cse', displayName: 'Nguyễn Minh Anh', scale: 0.46, speed: 0.35, max: 120 },
];

/** Danh sách "mỗi thiệp là một trang riêng". Thêm/bớt dòng ở đây. */
const PAGE_FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'calendar', title: 'Giờ lễ chính thức', body: 'Tự điền theo lịch của khoa, kèm thêm vào Google Calendar.' },
  { icon: 'map', title: 'Chỉ đường vào Hội trường A5', body: 'Cổng nào, gửi xe ở đâu, đi bộ bao xa.' },
  { icon: 'sparkle', title: 'Đếm ngược, rồi đổi thành chỉ dẫn trong ngày', body: 'Trước lễ là đếm ngược, đúng ngày lễ là lịch trình và việc cần mang.' },
  { icon: 'check', title: 'Điểm hẹn chụp ảnh sau lễ', body: 'Chọn một chỗ trong trường, ghi giờ hẹn, có đường đi tới đó.' },
  { icon: 'fork', title: 'Quán ăn quanh trường', body: 'Gợi ý cho cả nhà, lọc theo nhóm đông và chỗ đậu ô tô.' },
];

const STEPS = [
  { title: 'Chọn khoa', body: 'Ngày giờ lễ tự điền theo lịch chính thức của trường.' },
  { title: 'Chọn mẫu, viết lời nhắn', body: 'Sáu mẫu, mẫu nào cũng đổi màu và hoạ tiết theo khoa.' },
  { title: 'Gửi link', body: 'Mỗi nhóm một lời chào: Ba Mẹ, Ông Bà, bạn bè. Ai sẽ đến, bạn biết ngay.' },
];

const GUIDES: { href: string; icon: IconName; title: string; body: string }[] = [
  { href: '/guide', icon: 'calendar', title: 'Lịch theo khoa', body: 'Giờ lễ từng khoa, 26–29/11, Hội trường A5.' },
  { href: '/guide/map', icon: 'map', title: 'Bản đồ trong trường', body: 'Cổng, bãi xe, nhà vệ sinh, góc chụp ảnh.' },
  { href: '/eat', icon: 'fork', title: 'Ăn gì sau lễ', body: 'Quán quanh trường, lọc theo nhóm đông, chỗ đậu ô tô.' },
  { href: '/guide#tips', icon: 'sparkle', title: 'Mẹo cho người nhà', body: 'Đến sớm, ngồi đâu cho mát, chụp ở đâu đỡ đông.' },
];

export default function HomePage() {
  const next = nextCeremony();
  const days = scheduleByDay();
  const templates = listTemplates();
  // cùng một người, ba mẫu khác nhau -> minh hoạ "đổi mẫu không cần nhập lại"
  const SAME = { facultyId: 'cse', displayName: 'Nguyễn Minh Anh' };
  const SWAP = ['print', 'glass', 'riso'].map((id) => ({ id, name: templates.find((t) => t.id === id)?.name ?? id }));

  return (
    <>
      <SiteHeader />
      <main className={s.main}>
        {/* ---------- Hero ---------- */}
        <section className={s.hero}>
          {/* Ảnh tung mũ làm nền, phủ trắng cho mờ để chữ đọc được */}
          <div className={s.heroBg} aria-hidden="true">
            <Image src="/images/site/graduates.jpg" alt="" fill priority sizes="100vw" />
          </div>
          <div className={`container ${s.heroInner}`}>
            <div className={`${s.heroText} rise`}>
              <p className={s.heroKicker}>Lễ tốt nghiệp Bách Khoa · <span style={{ whiteSpace: 'nowrap' }}>26–29.11.2026</span></p>
              <h1 className={s.title}>
                Mời cả nhà đến ngày con thành <em>Tân Cử nhân</em>
              </h1>
              <p className={s.quote}>“Bốn năm chỉ cần một buổi sáng để nói lời cảm ơn.”</p>
              <p className={s.lead}>Thiệp mời online gửi bằng một đường link: đếm ngược, chỉ đường vào trường, điểm hẹn sau lễ.</p>
              <p className={s.meta}>Miễn phí · Không cần tài khoản · Tự xoá 30 ngày sau lễ</p>
              <div>
                <Button href="/templates" size="lg">Tạo thiệp ngay</Button>
              </div>
            </div>

            <div className={`${s.heroPhones} rise-2`} aria-hidden="true">
              <ParallaxLayer className={s.phoneBack} speed={HERO[0].speed} max={HERO[0].max}>
                <div className={s.phoneTilt}>
                  <PhoneFrame scale={HERO[0].scale} interactive={false}>
                    <InvitationCard card={sampleCard(HERO[0])} links={SAMPLE_LINKS} preview />
                  </PhoneFrame>
                </div>
              </ParallaxLayer>
              <ParallaxLayer className={s.phoneFront} speed={HERO[1].speed} max={HERO[1].max}>
                <div className={s.phoneTilt}>
                  <PhoneFrame scale={HERO[1].scale} interactive={false}>
                    <InvitationCard card={sampleCard(HERO[1])} links={SAMPLE_LINKS} preview />
                  </PhoneFrame>
                </div>
              </ParallaxLayer>
            </div>
          </div>
        </section>

        {/* ---------- Lịch lễ: chỉ thông tin ---------- */}
        <section className="container" aria-labelledby="h-schedule">
          <div className={s.schedule}>
            <header className={s.scheduleHead}>
              <h2 id="h-schedule" className={s.scheduleTitle}>Lịch lễ theo khoa</h2>
              <p className={s.scheduleNote}>
                Tất cả tổ chức tại Hội trường A5. Lễ gần nhất: {next.faculty.shortName},{' '}
                <Countdown ceremonyAt={next.at.toISOString()} initial={countdown(next.at)} variant="inline" />.
              </p>
            </header>
            <dl className={s.days}>
              {days.map((d) => (
                <div key={d.date} className={s.day}>
                  <dt className={s.dayLabel}>
                    <b>{d.date.slice(8, 10)}/{d.date.slice(5, 7)}</b>
                    <span>{d.label.replace(/,.*$/, '')}</span>
                  </dt>
                  <dd className={s.dayItems}>
                    {d.items.map((f) => (
                      <span key={f.id} className={s.dayItem}>
                        <span className={s.dayTime}>{f.time}</span>
                        <span>{f.name}</span>
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------- Mẫu thiệp: carousel ---------- */}
        <section className={s.section} aria-labelledby="h-templates">
          <div className="container">
            <header className={s.sectionHeadCenter}>
              <h2 id="h-templates" className={s.h2}>Mỗi khoa một <em>dáng vẻ</em></h2>
              <p className={s.sectionLead}>Hoá học có bình cầu, Máy tính có terminal, Xây dựng có bản vẽ. Màu và hoạ tiết tự đổi theo khoa của bạn.</p>
            </header>
            <TemplateCarousel
              slides={templates.map((t) => ({
                id: t.id,
                label: t.name,
                node: (
                  <PhoneFrame bare scale={0.64} interactive={false}>
                    <InvitationCard card={sampleCard(sampleOptionsFor(t.id))} links={SAMPLE_LINKS} preview />
                  </PhoneFrame>
                ),
              }))}
            />
            <div className={s.center}>
              <Button href="/templates" variant="secondary" trailing={<Icon name="arrow" size={16} />}>Xem tất cả mẫu thiệp</Button>
            </div>
          </div>
        </section>

        {/* ---------- Đổi mẫu không cần nhập lại (nền xanh đậm) ---------- */}
        <section className={s.band} aria-labelledby="h-swap">
          <div className={`container ${s.bandInner}`}>
            <div className={s.bandText}>
              <h2 id="h-swap" className={s.bandTitle}>Đổi mẫu, <em>không cần nhập lại</em></h2>
              <p className={s.bandLead}>
                Tên, khoa, lời nhắn, điểm hẹn bạn điền một lần. Thử mẫu nào cũng giữ nguyên thông tin,
                chọn lại thoải mái cho tới khi ưng ý.
              </p>
              <ul className={s.swapNames}>
                {SWAP.map((x) => <li key={x.id}>{x.name}</li>)}
              </ul>
            </div>
            <div className={s.swapPhones} aria-hidden="true">
              {SWAP.map((x, k) => (
                <div key={x.id} className={s.swapPhone} data-i={k}>
                  <PhoneFrame scale={0.46} interactive={false}>
                    <InvitationCard card={sampleCard({ templateId: x.id, ...SAME })} links={SAMPLE_LINKS} preview />
                  </PhoneFrame>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Mỗi thiệp là một trang web riêng ---------- */}
        <section className={`container ${s.pageSec}`} aria-labelledby="h-page">
          <div className={s.howBody}>
            <h2 id="h-page" className={s.h2}>Mỗi thiệp là một <em>trang web riêng</em></h2>
            <p className={s.sectionLead}>Không chỉ là một tấm ảnh. Người nhà mở link là có sẵn mọi thứ về buổi lễ của bạn.</p>
            <ul className={s.features}>
              {PAGE_FEATURES.map((f) => (
                <li key={f.title} className={s.feature}>
                  <span className={s.featureIcon}><Icon name={f.icon} size={20} /></span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Hình minh hoạ: thiệp thật ở chế độ "trong ngày lễ". Thay bằng ảnh/video khác ở đây. */}
          <div className={s.pageVisual} aria-hidden="true">
            <PhoneFrame scale={0.7} interactive={false}>
              <InvitationCard card={sampleCard({ ...sampleOptionsFor('print'), mode: 'dayof' })} links={SAMPLE_LINKS} preview />
            </PhoneFrame>
          </div>
        </section>

        {/* ---------- Cách làm ---------- */}
        <section className={`container ${s.how}`} aria-labelledby="h-how">
          <div className={s.photo}>
            <Image src="/images/site/yellow-carpet.jpg" alt="Sân trường Bách Khoa phủ hoa vàng" fill sizes="(max-width: 900px) 100vw, 560px" />
          </div>
          <div className={s.howBody}>
            <h2 id="h-how" className={s.h2}>Ba bước, <em>một đường link</em></h2>
            <ol className={s.steps}>
              {STEPS.map((st, i) => (
                <li key={st.title} className={s.step}>
                  <span className={s.stepNum}>{i + 1}</span>
                  <div>
                    <h3>{st.title}</h3>
                    <p>{st.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button href="/templates" trailing={<Icon name="arrow" size={16} />}>Bắt đầu tạo thiệp</Button>
          </div>
        </section>

        {/* ---------- Dẫn đường ---------- */}
        <section className={s.section} aria-labelledby="h-guide">
          <div className="container">
            <header className={s.sectionHead}>
              <h2 id="h-guide" className={s.h2}>Người dẫn đường <em>ngày lễ</em></h2>
              <p className={s.sectionLead}>Ông bà, ba mẹ lần đầu vào trường? Mọi thứ cần biết nằm gọn ở đây, mở được cả khi mạng chậm.</p>
            </header>
            <ul className={s.guides}>
              {GUIDES.map((g) => (
                <li key={g.href}>
                  <Link href={g.href} className={s.guide}>
                    <span className={s.guideIcon}><Icon name={g.icon} size={22} /></span>
                    <h3>{g.title}</h3>
                    <p>{g.body}</p>
                    <span className={s.guideMore}>Xem <Icon name="arrow" size={14} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- CTA cuối: mỗi lễ một thiệp + đếm ngược lễ gần nhất ---------- */}
        <section className="container">
          <div className={s.final}>
            <div className={s.finalText}>
              <h2 className={s.finalTitle}>Mỗi lễ một thiệp, gửi sớm để Ba Mẹ kịp sắp xếp.</h2>
              <p>Tạo xong là có link gửi ngay, thiệp tự cập nhật theo ngày lễ.</p>
              <div>
                <Button href="/templates" variant="white" size="lg" trailing={<Icon name="arrow" size={18} />}>Tạo thiệp ngay</Button>
              </div>
            </div>
            <div className={s.finalClock}>
              <p className={s.finalClockLabel}>Lễ gần nhất: {next.faculty.name}, {formatTimeVi(next.at)}</p>
              <LiveCountdown at={next.at.toISOString()} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
