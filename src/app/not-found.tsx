import { Button, Icon, Page } from '@/ui';

export default function NotFound() {
  return (
    <Page width="narrow">
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start', padding: '48px 0' }}>
        <p className="eyebrow">Lỗi 404</p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--bk-700)' }}>
          Lạc đường <em style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--bk-500)' }}>giữa sân trường</em>
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-lg)' }}>Trang này không tồn tại, hoặc thiệp đã bị xoá sau lễ.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button href="/" variant="secondary">Về trang chủ</Button>
          <Button href="/create" trailing={<Icon name="arrow" size={16} />}>Tạo thiệp tốt nghiệp</Button>
        </div>
      </div>
    </Page>
  );
}
