import { z } from 'zod';
import { createCard, createCardSchema } from '@/modules/card';
import { recordConsent, TERMS_VERSION } from '@/modules/legal';
import { getEnv } from '@/lib/env';
import { badRequest, handle, ok, readJson, tooMany } from '@/lib/http';
import { clientIp, limiter, RULES, verifyTurnstile } from '@/modules/moderation';

/** Tạo thiệp bắt buộc đồng ý điều khoản, và đúng phiên bản đang hiện cho người dùng. */
const createCardRequestSchema = createCardSchema.extend({
  acceptTerms: z.literal(true),
  termsVersion: z.string().min(1),
});

export const POST = handle(async (req: Request) => {
  const ip = clientIp(req);
  if (!limiter.hit(`create:${ip}`, RULES.createCard).allowed) throw tooMany();
  const input = await readJson(req, (raw) => createCardRequestSchema.parse(raw));
  // Điều khoản đã đổi trong lúc người dùng đang soạn → bắt tải lại để đọc bản mới.
  if (input.termsVersion !== TERMS_VERSION) throw badRequest('terms_outdated');
  if (!(await verifyTurnstile(input.turnstileToken, ip))) throw badRequest('turnstile_failed');
  const { card, manageToken } = await createCard(input);
  await recordConsent(card.id, input.termsVersion, { ip, userAgent: req.headers.get('user-agent') });
  const base = getEnv().NEXT_PUBLIC_SITE_URL;
  return ok(
    {
      slug: card.slug,
      url: `${base}/${card.slug}`,
      manageToken,
      manageUrl: `${base}/manage/${manageToken}`,
    },
    { status: 201 },
  );
});
