import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Tắt Cache Components để dùng mô hình quen thuộc: trang thiệp là dynamic SSR,
  // trang tĩnh (landing, cẩm nang) được prerender. Bật lại khi tối ưu hiệu năng sau.
  cacheComponents: false,
  reactStrictMode: true,
};

export default nextConfig;
