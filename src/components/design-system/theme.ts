import { Platform, useColorScheme, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Semantic colour tokens. Every text/background pair is asserted >= 4.5:1 (controls >= 3:1)
 * in tests/unit/theme.test.ts, in BOTH themes. Never hard-code hex in screens.
 */
export const palette = {
  light: {
    bg: '#FAF7F0', surface: '#FFFFFF', surfaceAlt: '#F1EDE1',
    border: '#E3DDCF',            // decorative card edges
    controlBorder: '#8A8473',     // inputs / outlined controls (>= 3:1)
    text: '#14203B', textMuted: '#4A5468',
    primary: '#14203B', onPrimary: '#FFFFFF',
    accent: '#E4DFF7', onAccent: '#2B2457', accentStrong: '#5240A8',
    success: '#2B6F4F', successTint: '#E0EEE6',
    warning: '#7A5200', warningTint: '#FBEBC8',
    danger: '#A33A34', dangerTint: '#F8E1DE',
    math: '#37599A', physics: '#6648B0', chemistry: '#2F6F55',
    mathTint: '#E3EAF6', physicsTint: '#EAE4F7', chemistryTint: '#E0EEE6',
    track: 'rgba(20,32,59,0.12)',
    scrim: 'rgba(20,32,59,0.55)',
  },
  dark: {
    bg: '#0E1322', surface: '#161D33', surfaceAlt: '#1E2742',
    border: '#2E3858', controlBorder: '#6B7596',
    text: '#F1EEE6', textMuted: '#B4BCCF',
    primary: '#D9D3F5', onPrimary: '#14203B',
    accent: '#3A3270', onAccent: '#E7E3FA', accentStrong: '#C9BEF5',
    success: '#7FCBA3', successTint: '#1B3A30',
    warning: '#E8C068', warningTint: '#3A3016',
    danger: '#F0908A', dangerTint: '#3F2224',
    math: '#8FB0E8', physics: '#B7A2F0', chemistry: '#7FCBA3',
    mathTint: '#1D2A47', physicsTint: '#2A2347', chemistryTint: '#1B3A30',
    track: 'rgba(255,255,255,0.16)',
    scrim: 'rgba(0,0,0,0.65)',
  },
} as const;

export type Colors = { [K in keyof (typeof palette)['light']]: string };

/** 4/8-point rhythm. Tiers: component 8/16, section 24, page 32/48. */
export const space = { xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;
export const MIN_TOUCH = 48; // Android 48dp (iOS 44pt is smaller, so 48 satisfies both)
export const icon = { sm: 18, md: 22, lg: 28 } as const;

/** Editorial serif for display text; system sans for everything else (no extra font downloads). */
export const fonts = {
  display: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
  body: undefined as string | undefined,
};

export const type = {
  display: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, fontWeight: '700' as const },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  heading: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  stat: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
};

/** Motion tokens: short and purposeful. Enter slower than exit. */
export const motion = { fast: 120, base: 220, slow: 320 } as const;

export function useTheme() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return { colors: (dark ? palette.dark : palette.light) as Colors, dark };
}

export type SubjectKeyDs = 'math' | 'physics' | 'chemistry';
export const subjectColor = (c: Colors, s: SubjectKeyDs) => c[s];
export const subjectTint = (c: Colors, s: SubjectKeyDs) => c[`${s}Tint` as const];

/** Bottom inset (system navigation bar) so scrollable stack screens can reach their last control. */
export const useBottomInset = () => useSafeAreaInsets().bottom;

/** Phone vs tablet layout: adaptive gutters and a readable max content width. */
export function useLayout() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  return { width, isTablet, wide: width >= 960, gutter: isTablet ? space.lg : space.md, maxWidth: 840 };
}
