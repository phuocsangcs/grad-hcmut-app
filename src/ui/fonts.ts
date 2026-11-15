/**
 * Font tự host qua @fontsource (không gọi Google Fonts → đúng cam kết không tracker).
 * Import file này một lần trong app/layout.tsx. Tên font được tham chiếu qua CSS variable
 * trong src/ui/tokens.css (--font-sans, --font-display, --font-mono, --font-script).
 */
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import '@fontsource-variable/playfair-display/wght.css';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import '@fontsource-variable/dancing-script/wght.css';

export const FONT_FAMILIES = {
  sans: "'Be Vietnam Pro', system-ui, -apple-system, 'Segoe UI', sans-serif",
  display: "'Playfair Display Variable', 'Playfair Display', Georgia, serif",
  mono: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, Menlo, monospace",
  script: "'Dancing Script Variable', 'Dancing Script', cursive",
} as const;
