import QRCode from 'qrcode';

export type QrFormat = 'png' | 'svg';

export async function renderQr(url: string, format: QrFormat = 'png', size = 512): Promise<{ body: Buffer | string; contentType: string }> {
  const opts = { errorCorrectionLevel: 'M' as const, margin: 2, width: size, color: { dark: '#0f2a5f', light: '#ffffff' } };
  if (format === 'svg') {
    return { body: await QRCode.toString(url, { ...opts, type: 'svg' }), contentType: 'image/svg+xml' };
  }
  return { body: await QRCode.toBuffer(url, { ...opts, type: 'png' }), contentType: 'image/png' };
}
