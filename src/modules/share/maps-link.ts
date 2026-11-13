import { poisFile, type Eatery, type Poi } from '@/modules/content';

/** Chỉ đường tới cổng trường. Mở app Google Maps nếu có, không thì web. */
export function directionsToCampusUrl(): string {
  const { lat, lng } = poisFile.campus.gate;
  const p = new URLSearchParams({ api: '1', destination: `${lat},${lng}`, travelmode: 'driving' });
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}

/** Tìm quán trên Maps. */
export function eaterySearchUrl(e: Eatery): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.mapsQuery)}`;
}

/** POI trong trường không có toạ độ riêng; dẫn tới cổng + tên để khách hỏi đường. */
export function poiSearchUrl(p: Poi): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${poisFile.campus.address}`)}`;
}

export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Zalo không có share URL công khai ổn định; dùng Web Share API ở client, đây là fallback. */
export function messengerShareUrl(url: string): string {
  return `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&redirect_uri=${encodeURIComponent(url)}`;
}
