import { palette } from '../../src/components/design-system/theme';

const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a: string, b: string) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

describe.each(['light', 'dark'] as const)('%s theme contrast (WCAG AA)', (mode) => {
  const c = palette[mode];
  const bgs = [c.bg, c.surface, c.surfaceAlt] as const;

  it('body and muted text are >= 4.5:1 on every surface', () => {
    for (const bg of bgs) for (const fg of [c.text, c.textMuted]) expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
  it('primary buttons and accent chips are readable', () => {
    expect(ratio(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(c.onAccent, c.accent)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(c.accentStrong, c.bg)).toBeGreaterThanOrEqual(4.5);
  });
  it.each(['math', 'physics', 'chemistry'] as const)('%s colour works as text on surfaces and on its own tint', (s) => {
    for (const bg of [c.bg, c.surface, c[`${s}Tint` as const]]) expect(ratio(c[s], bg)).toBeGreaterThanOrEqual(4.5);
  });
  it('selected subject chips (onPrimary on subject colour) are readable', () => {
    for (const s of ['math', 'physics', 'chemistry'] as const) expect(ratio(c.onPrimary, c[s])).toBeGreaterThanOrEqual(mode === 'light' ? 4.5 : 4.5);
  });
  it('status colours are readable on their tints and surfaces', () => {
    expect(ratio(c.success, c.surface)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(c.success, c.successTint)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(c.warning, c.warningTint)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(c.danger, c.surface)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(c.danger, c.dangerTint)).toBeGreaterThanOrEqual(4.5);
  });
  it('control borders are >= 3:1 against the surfaces they sit on', () => {
    for (const bg of [c.bg, c.surface]) expect(ratio(c.controlBorder, bg)).toBeGreaterThanOrEqual(3);
  });
});
