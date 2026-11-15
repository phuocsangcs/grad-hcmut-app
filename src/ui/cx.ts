/** Ghép class, bỏ giá trị rỗng. Thay cho clsx để không thêm dependency. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
