import { z } from 'zod';

export const REPORT_REASONS = ['spam', 'offensive', 'impersonation', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam / quảng cáo',
  offensive: 'Nội dung phản cảm',
  impersonation: 'Giả mạo người khác',
  other: 'Lý do khác',
};

export const submitReportSchema = z.object({
  reason: z.enum(REPORT_REASONS),
  detail: z.string().trim().max(500).optional().nullable(),
});
export type SubmitReportInput = z.infer<typeof submitReportSchema>;
