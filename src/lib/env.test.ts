import { describe, expect, it } from 'vitest';
import { resolveSiteUrl } from './env';

describe('resolveSiteUrl', () => {
  it('ưu tiên NEXT_PUBLIC_SITE_URL, bỏ dấu / cuối', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://ngayratruong.vn/', VERCEL_ENV: 'production', VERCEL_URL: 'x.vercel.app' })).toBe('https://ngayratruong.vn');
  });
  it('Vercel production không đặt biến → tên miền production của dự án', () => {
    expect(resolveSiteUrl({ VERCEL_ENV: 'production', VERCEL_URL: 'grad-abc123.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'grad-hcmut.vercel.app' })).toBe('https://grad-hcmut.vercel.app');
  });
  it('Vercel preview → URL của bản preview', () => {
    expect(resolveSiteUrl({ VERCEL_ENV: 'preview', VERCEL_URL: 'grad-git-feat.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'grad-hcmut.vercel.app' })).toBe('https://grad-git-feat.vercel.app');
  });
  it('máy dev → localhost', () => {
    expect(resolveSiteUrl({})).toBe('http://localhost:3000');
  });
});
