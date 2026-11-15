import { z } from 'zod';
import { badRequest, handle, ok, readJson, tooMany } from '@/lib/http';
import { isStorageEnabled, presignUpload } from '@/lib/storage';
import { PHOTO_MAX_BYTES, PHOTO_TYPES } from '@/lib/storage-keys';
import { clientIp, limiter, RULES } from '@/modules/moderation';

const bodySchema = z.object({
  contentType: z.enum(Object.keys(PHOTO_TYPES) as [keyof typeof PHOTO_TYPES, ...(keyof typeof PHOTO_TYPES)[]]),
  size: z.number().int().positive().max(PHOTO_MAX_BYTES),
});

/**
 * Xin link để trình duyệt tải ảnh thẳng lên R2 (Vercel giới hạn body ~4.5MB nên không đi qua server).
 * Ảnh vào pending/, chỉ được giữ lại nếu thiệp được tạo với khoá này.
 */
export const POST = handle(async (req: Request) => {
  if (!isStorageEnabled()) throw badRequest('storage_disabled');
  if (!limiter.hit(`upload:${clientIp(req)}`, RULES.upload).allowed) throw tooMany();
  const { contentType, size } = await readJson(req, (raw) => bodySchema.parse(raw));
  return ok(await presignUpload(contentType, size));
});
