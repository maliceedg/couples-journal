/** Predefined pastel accent colors that work with the app layout */
export const ACCENT_COLORS = [
  { id: 'purple', hex: '#A56CB9', dark: '#86499B', label: 'Lavender' },
  { id: 'rose', hex: '#E8A0BF', dark: '#C97A9E', label: 'Rose' },
  { id: 'mint', hex: '#7FCDB8', dark: '#5BA895', label: 'Mint' },
  { id: 'sky', hex: '#7EB8E3', dark: '#5A9BC9', label: 'Sky' },
  { id: 'peach', hex: '#F4C2A0', dark: '#D4A574', label: 'Peach' },
  { id: 'lilac', hex: '#B8A9C9', dark: '#9585A8', label: 'Lilac' },
  { id: 'sage', hex: '#9CB89C', dark: '#7A9A7A', label: 'Sage' },
  { id: 'blush', hex: '#D4A5A5', dark: '#B08080', label: 'Blush' },
] as const;

/** Normalize hex to always have # and 6 chars for comparison/use. */
export function normalizeHex(hex: string): string {
  const h = (hex || '').trim();
  return h.startsWith('#') ? h : `#${h}`;
}

export function getAccentByHex(hex: string): (typeof ACCENT_COLORS)[number] | undefined {
  const normalized = normalizeHex(hex);
  return ACCENT_COLORS.find((c) => c.hex.toLowerCase() === normalized.toLowerCase());
}

export function getDefaultAccent(): (typeof ACCENT_COLORS)[number] {
  return ACCENT_COLORS[0];
}

/** Light background tint from accent hex (e.g. for page background). */
export function lightTintFromHex(hex: string, whiteRatio = 0.92): string {
  const h = normalizeHex(hex).replace(/^#/, '');
  if (h.length !== 6) return '#FCF5FD';
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  const r2 = Math.round(255 * whiteRatio + r * (1 - whiteRatio));
  const g2 = Math.round(255 * whiteRatio + g * (1 - whiteRatio));
  const b2 = Math.round(255 * whiteRatio + b * (1 - whiteRatio));
  return `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
}

/** Dark background tint from accent hex (e.g. for dark mode page background). */
export function darkTintFromHex(hex: string, darkRatio = 0.92): string {
  const h = normalizeHex(hex).replace(/^#/, '');
  if (h.length !== 6) return '#1E1220';
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  const base = 18;
  const r2 = Math.round(base * darkRatio + r * (1 - darkRatio) * 0.25);
  const g2 = Math.round(base * darkRatio + g * (1 - darkRatio) * 0.2);
  const b2 = Math.round(base * darkRatio + b * (1 - darkRatio) * 0.35);
  return `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`;
}

/** Relative luminance (0–1). Used to pick text color on background. */
export function luminance(hex: string): number {
  const h = normalizeHex(hex).replace(/^#/, '');
  if (h.length !== 6) return 0;
  const r = Number.parseInt(h.slice(0, 2), 16) / 255;
  const g = Number.parseInt(h.slice(2, 4), 16) / 255;
  const b = Number.parseInt(h.slice(4, 6), 16) / 255;
  const [rs, gs, bs] = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Optimal text color on a background (hex): dark for light accents, white for dark. */
export function textColorOnBackground(hex: string): string {
  return luminance(hex) > 0.45 ? '#1f2937' : '#ffffff';
}

/** Hex color with alpha (e.g. for hearts overlay). alpha 0–1. */
export function hexWithAlpha(hex: string, alpha: number): string {
  const h = normalizeHex(hex).replace(/^#/, '');
  if (h.length !== 6) return hex;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return `rgba(${r},${g},${b},${a / 255})`;
}
