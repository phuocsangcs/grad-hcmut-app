import { getGreetingGroup, greetingsFile } from '@/modules/content';

export type GreetingInput = {
  /** Lời chào riêng của người nhận (invites.greeting) */
  inviteGreeting?: string | null;
  /** Tên người nhận (invites.recipient_name) → "Gửi Cô Hoa," */
  recipientName?: string | null;
  /** Nhóm: từ invite.group_key hoặc ?to= */
  groupKey?: string | null;
  /** Override theo nhóm của chủ thiệp (cards.greetings) */
  cardGreetings?: Record<string, string> | null;
};

/**
 * Thứ tự ưu tiên:
 * 1. lời chào riêng của người nhận
 * 2. chủ thiệp override theo nhóm
 * 3. preset theo nhóm trong greetings.json
 * 4. "Gửi <tên người nhận>," nếu có tên
 * 5. mặc định
 */
export function resolveGreeting(input: GreetingInput): string {
  const g = input.inviteGreeting?.trim();
  if (g) return g;
  const key = input.groupKey ?? undefined;
  if (key) {
    const override = input.cardGreetings?.[key]?.trim();
    if (override) return override;
    const preset = getGreetingGroup(key);
    if (preset) return preset.greeting;
  }
  const name = input.recipientName?.trim();
  if (name) return `Gửi ${name},`;
  return greetingsFile.defaultGreeting;
}

/** Nhóm hợp lệ hay không, dùng để làm sạch ?to= */
export function normalizeGroupKey(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return getGreetingGroup(raw) ? raw : null;
}
