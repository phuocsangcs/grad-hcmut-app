import { clientIp, limiter, RULES, submitReport, submitReportSchema } from '@/modules/moderation';
import { handle, ok, readJson, tooMany } from '@/lib/http';

export const POST = handle(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const ip = clientIp(req);
  if (!limiter.hit(`report:${ip}`, RULES.report).allowed) throw tooMany();
  const { slug } = await ctx.params;
  const input = await readJson(req, (raw) => submitReportSchema.parse(raw));
  await submitReport(slug, input, ip);
  // Không trả autoLocked để người báo cáo không biết ngưỡng.
  return ok({ received: true }, { status: 201 });
});
