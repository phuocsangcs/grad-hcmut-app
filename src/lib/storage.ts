import { CopyObjectCommand, DeleteObjectsCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { customAlphabet } from 'nanoid';
import { getEnv } from '@/lib/env';
import { CARD_KEY_RE, PHOTO_MAX_BYTES, PHOTO_TYPES, isPhotoType, type PhotoType } from '@/lib/storage-keys';

/**
 * Lưu ảnh thiệp trên Cloudflare R2 (tương thích S3). Chỉ import từ code chạy phía server.
 * Quy ước khoá (hằng số nằm trong storage-keys.ts):
 *   pending/<id>.<ext>        ảnh vừa tải lên, chưa gắn thiệp (đặt lifecycle xoá sau 1 ngày)
 *   cards/<cardId>/<id>.<ext> ảnh đã gắn vào thiệp
 */

const fileId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 21);

type Config = { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string; publicUrl: string };

function config(): Config | null {
  const e = getEnv();
  if (!e.R2_ACCOUNT_ID || !e.R2_ACCESS_KEY_ID || !e.R2_SECRET_ACCESS_KEY || !e.R2_BUCKET || !e.R2_PUBLIC_URL) return null;
  return {
    accountId: e.R2_ACCOUNT_ID,
    accessKeyId: e.R2_ACCESS_KEY_ID,
    secretAccessKey: e.R2_SECRET_ACCESS_KEY,
    bucket: e.R2_BUCKET,
    publicUrl: e.R2_PUBLIC_URL.replace(/\/+$/, ''),
  };
}

/** Đã cấu hình đủ biến R2 chưa. Chưa thì ẩn tính năng ảnh. */
export const isStorageEnabled = () => config() !== null;

/** URL công khai của một khoá. Không cần gọi mạng. Chưa cấu hình thì trả chuỗi rỗng. */
export function publicUrl(key: string): string {
  const c = config();
  return c ? `${c.publicUrl}/${key}` : '';
}

let client: S3Client | undefined;
function s3(c: Config): S3Client {
  return (client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${c.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey },
  }));
}

function need(): Config {
  const c = config();
  if (!c) throw new Error('storage_disabled');
  return c;
}

/** Cấp link PUT có hạn 5 phút, ký theo loại file. Dung lượng được kiểm tra lại ở verifyPending. */
export async function presignUpload(contentType: PhotoType, size: number): Promise<{ key: string; uploadUrl: string; publicUrl: string }> {
  const c = need();
  const key = `pending/${fileId()}.${PHOTO_TYPES[contentType]}`;
  const cmd = new PutObjectCommand({ Bucket: c.bucket, Key: key, ContentType: contentType, ContentLength: size });
  const uploadUrl = await getSignedUrl(s3(c), cmd, { expiresIn: 300 });
  return { key, uploadUrl, publicUrl: `${c.publicUrl}/${key}` };
}

/** File đã được tải lên đúng loại và không quá lớn? */
export async function verifyPending(key: string): Promise<boolean> {
  const c = need();
  try {
    const head = await s3(c).send(new HeadObjectCommand({ Bucket: c.bucket, Key: key }));
    const size = head.ContentLength ?? 0;
    return isPhotoType(head.ContentType ?? '') && size > 0 && size <= PHOTO_MAX_BYTES;
  } catch {
    return false;
  }
}

/** Chuyển ảnh chờ vào thư mục của thiệp. Trả về khoá mới. Bản chờ để lifecycle tự dọn. */
export async function adoptPending(key: string, cardId: string): Promise<string> {
  const c = need();
  const dest = `cards/${cardId}/${key.slice('pending/'.length)}`;
  await s3(c).send(new CopyObjectCommand({ Bucket: c.bucket, Key: dest, CopySource: `${c.bucket}/${key}` }));
  return dest;
}

/** Xoá nhiều file. Bỏ qua khi chưa cấu hình; lỗi chỉ ghi log để không chặn việc xoá thiệp. */
export async function deleteKeys(keys: string[]): Promise<void> {
  const c = config();
  const safe = keys.filter((k) => CARD_KEY_RE.test(k));
  if (!c || safe.length === 0) return;
  try {
    for (let i = 0; i < safe.length; i += 1000) {
      const Objects = safe.slice(i, i + 1000).map((Key) => ({ Key }));
      await s3(c).send(new DeleteObjectsCommand({ Bucket: c.bucket, Delete: { Objects, Quiet: true } }));
    }
  } catch (e) {
    console.error('Không xoá được ảnh trên R2', e);
  }
}
