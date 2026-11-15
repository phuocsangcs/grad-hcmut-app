/** Tách lời chào "Gửi Ba Mẹ," thành phần chữ để template tuỳ ý style. */
export function splitGreeting(greeting: string): { lead: string; name: string } {
  const m = greeting.match(/^(Gửi|Kính gửi|Thân gửi|Ê)\s+(.+?)[,!]?$/u);
  if (!m) return { lead: '', name: greeting };
  return { lead: m[1], name: m[2] };
}
