import { checkSlug, checkSlugQuerySchema } from '@/modules/card';
import { handle, ok } from '@/lib/http';

export const GET = handle(async (req: Request) => {
  const url = new URL(req.url);
  const q = checkSlugQuerySchema.parse({
    slug: url.searchParams.get('slug') ?? '',
    facultyId: url.searchParams.get('facultyId') ?? undefined,
  });
  return ok(await checkSlug(q.slug, q.facultyId));
});
