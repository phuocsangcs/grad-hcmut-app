import type { Metadata } from 'next';
import { getEnv } from '@/lib/env';
import { formatDateVi, formatTimeVi } from '@/lib/time';
import type { PublicCard } from '@/modules/card/card.service';

/** Metadata cho thẻ link Zalo/Messenger. Ảnh OG tĩnh theo mẫu; ảnh động làm sau. */
export function cardMetadata(c: PublicCard, path: string): Metadata {
  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  const at = new Date(c.ceremonyAt);
  const title = c.recipientName
    ? `${c.displayName} gửi thiệp tốt nghiệp cho ${c.recipientName}`
    : `${c.displayName} mời bạn dự lễ tốt nghiệp`;
  const description = `${formatDateVi(at)} · ${formatTimeVi(at)} · ${c.venue} · ${c.faculty.shortName}`;
  const url = `${base}${path}`;
  const image = c.template.ogImage.startsWith('http') ? c.template.ogImage : `${base}${c.template.ogImage}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', locale: 'vi_VN', images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    robots: { index: false, follow: false }, // thiệp cá nhân, không cho Google index
  };
}
