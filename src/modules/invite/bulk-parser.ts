import { INVITE_LEAD_MAX, INVITEE_MAX } from '@/modules/content';

export type BulkRow = {
  recipientName: string;
  /** Câu mời riêng ("Kính mời"…); null → dùng câu mời của thiệp. */
  greeting: string | null;
  templateId: string | null;
};

export type BulkParseError = { line: number; raw: string; message: string };

export type BulkParseResult = { rows: BulkRow[]; errors: BulkParseError[] };

export const BULK_MAX_ROWS = 200;

/**
 * Nhận văn bản dán từ Excel / Zalo / Notes. Mỗi dòng một người.
 * Cột phân cách bằng TAB (Excel) hoặc dấu phẩy / chấm phẩy:
 *   Tên
 *   Tên, câu mời
 *   Tên, câu mời, mẫu
 * Câu mời trống → dùng câu mời của thiệp (vd. "Thương mời").
 * Dòng trống và dòng tiêu đề ("Tên", "Name") bị bỏ qua.
 */
export function parseBulkText(text: string, validTemplateIds: ReadonlySet<string>): BulkParseResult {
  const rows: BulkRow[] = [];
  const errors: BulkParseError[] = [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');

  lines.forEach((rawLine, idx) => {
    const line = idx + 1;
    const raw = rawLine.trim();
    if (!raw) return;
    const [name = '', lead = '', template = ''] = splitColumns(raw);

    if (idx === 0 && /^(tên|ten|name|họ tên|ho ten)$/i.test(name)) return; // header

    if (!name) return errors.push({ line, raw, message: 'Thiếu tên' }) && undefined;
    if (name.length > INVITEE_MAX) return errors.push({ line, raw, message: `Tên quá ${INVITEE_MAX} ký tự` }) && undefined;
    if (lead.length > INVITE_LEAD_MAX) return errors.push({ line, raw, message: `Câu mời quá ${INVITE_LEAD_MAX} ký tự` }) && undefined;

    let templateId: string | null = null;
    if (template) {
      if (!validTemplateIds.has(template)) return errors.push({ line, raw, message: `Mẫu "${template}" không tồn tại` }) && undefined;
      templateId = template;
    }

    rows.push({ recipientName: name, greeting: lead || null, templateId });
  });

  if (rows.length > BULK_MAX_ROWS) {
    errors.push({ line: 0, raw: '', message: `Tối đa ${BULK_MAX_ROWS} người mỗi lần` });
  }
  return { rows, errors };
}

function splitColumns(line: string): string[] {
  const sep = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
  return line.split(sep).map((c) => c.trim());
}
