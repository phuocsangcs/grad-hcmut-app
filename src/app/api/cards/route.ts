import { createCard, createCardSchema } from '@/modules/card';
import { getEnv } from '@/lib/env';
import { badRequest, handle, ok, readJson, tooMany } from '@/lib/http';
import { clientIp, limiter, RULES, verifyTurnstile } from '@/modules/moderation';

export const POST = handle(async (req: Request) => {
  const ip = clientIp(req);
  if (!limiter.hit(`create:${ip}`, RULES.createCard).allowed) throw tooMany();
  const input = await readJson(req, (raw) => createCardSchema.parse(raw));
  if (!(await verifyTurnstile(input.turnstileToken, ip))) throw badRequest('turnstile_failed');
  const { card, manageToken } = await createCard(input);
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
