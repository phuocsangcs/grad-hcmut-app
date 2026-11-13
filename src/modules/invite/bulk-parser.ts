import { getGreetingGroup, listGreetingGroups } from '@/modules/content';

export type BulkRow = {
  recipientName: string;
  groupKey: string | null;
  greeting: string | null;
  templateId: string | null;
};

export type BulkParseError = { line: number; raw: string; message: string };

export type BulkParseResult = { rows: BulkRow[]; errors: BulkParseError[] };

export const BULK_MAX_ROWS = 200;
const NAME_MAX = 60;
const GREETING_MAX = 200;

/**
 * Nhận văn bản dán từ Excel / Zalo / Notes. Mỗi dòng một người.
 * Cột phân cách bằng TAB (Excel) hoặc dấu phẩy / chấm phẩy:
 *   Tên
 *   Tên, nhóm
 *   Tên, nhóm, lời chào riêng
 *   Tên, nhóm, lời chào riêng, mẫu
 * Nhóm nhận cả key (parents) hoặc nhãn tiếng Việt (Ba Mẹ), không phân biệt hoa thường.
 * Lời chào có dấu phẩy thì dùng Tab hoặc chấm phẩy làm phân cách (Excel copy ra là Tab nên không vướng).
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
    const cols = splitColumns(raw);
    const [name = '', group = '', greeting = '', template = ''] = cols;

    if (idx === 0 && /^(tên|ten|name|họ tên|ho ten)$/i.test(name)) return; // header

    if (!name) return errors.push({ line, raw, message: 'Thiếu tên' }) && undefined;
    if (name.length > NAME_MAX) return errors.push({ line, raw, message: `Tên quá ${NAME_MAX} ký tự` }) && undefined;

    let groupKey: string | null = null;
    if (group) {
      groupKey = resolveGroup(group);
      if (!groupKey) return errors.push({ line, raw, message: `Nhóm "${group}" không hợp lệ (${groupHint()})` }) && undefined;
    }
    if (greeting.length > GREETING_MAX) return errors.push({ line, raw, message: `Lời chào quá ${GREETING_MAX} ký tự` }) && undefined;

    let templateId: string | null = null;
    if (template) {
      if (!validTemplateIds.has(template)) return errors.push({ line, raw, message: `Mẫu "${template}" không tồn tại` }) && undefined;
      templateId = template;
    }

    rows.push({ recipientName: name, groupKey, greeting: greeting || null, templateId });
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

function resolveGroup(input: string): string | null {
  const s = input.trim().toLowerCase();
  if (getGreetingGroup(s)) return s;
  const byLabel = listGreetingGroups().find((g) => g.label.toLowerCase() === s);
  return byLabel?.key ?? null;
}

function groupHint(): string {
  return listGreetingGroups().map((g) => `${g.key}=${g.label}`).join(', ');
}
