import { createCard, createCardSchema } from '@/modules/card';
import { getEnv } from '@/lib/env';
import { handle, ok, readJson } from '@/lib/http';

export const POST = handle(async (req: Request) => {
  const input = await readJson(req, (raw) => createCardSchema.parse(raw));
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
