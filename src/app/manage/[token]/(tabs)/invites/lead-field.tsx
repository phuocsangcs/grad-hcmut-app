'use client';

import { Field, Input, Select } from '@/ui';

/** Giá trị đánh dấu "đang tự viết nhưng chưa gõ gì" (khác '' = như thiệp). */
const CUSTOM_EMPTY = ' ';

/**
 * Chọn câu mời cho một khách: "Như thiệp" (để trống), câu chọn sẵn, hoặc tự viết.
 * value '' = dùng câu mời của thiệp. Gửi API qua leadValue().
 */
export function LeadField({ value, onChange, leads, cardLead, id }: { value: string; onChange: (v: string) => void; leads: string[]; cardLead: string; id: string }) {
  const custom = value !== '' && !leads.includes(value);
  const selected = custom ? '__custom' : value;
  return (
    <>
      <Field label="Câu mời">
        <Select id={id} value={selected} onChange={(e) => onChange(e.target.value === '__custom' ? CUSTOM_EMPTY : e.target.value)}>
          <option value="">Như thiệp ({cardLead})</option>
          {leads.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
          <option value="__custom">Tự viết…</option>
        </Select>
      </Field>
      {custom ? (
        <Field label="Câu mời riêng" hint="Tối đa 40 ký tự">
          <Input maxLength={40} autoFocus value={value.trimStart()} placeholder="Thân gửi" onChange={(e) => onChange(e.target.value || CUSTOM_EMPTY)} />
        </Field>
      ) : null}
    </>
  );
}

/** Chuẩn hoá trước khi gửi API: tự viết nhưng để trống → null (như thiệp). */
export const leadValue = (v: string) => v.trim() || null;
