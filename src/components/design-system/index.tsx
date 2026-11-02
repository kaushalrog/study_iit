import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { icon as iconSize, MIN_TOUCH, motion, radius, space, SubjectKeyDs, subjectColor, subjectTint, type, useBottomInset, useLayout, useTheme } from './theme';

export { useTheme, space, radius, useBottomInset, useLayout, MIN_TOUCH, type, motion, fonts } from './theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Vector icon from a single family. Decorative by default (hidden from screen readers). */
export function Icon({ name, size = 'md', color, label }: { name: IconName; size?: keyof typeof iconSize; color?: string; label?: string }) {
  const { colors } = useTheme();
  return (
    <Ionicons name={name} size={iconSize[size]} color={color ?? colors.text}
      accessible={!!label} accessibilityLabel={label} importantForAccessibility={label ? 'yes' : 'no-hide-descendants'} accessibilityElementsHidden={!label} />
  );
}

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>{children}</View>;
}

/** Scrolling page with adaptive gutters, a readable max width on tablets, and system-bar clearance. */
export function Page({ children, bottomExtra = 0, keyboardShouldPersistTaps }: { children: React.ReactNode; bottomExtra?: number; keyboardShouldPersistTaps?: 'always' | 'handled' | 'never' }) {
  const { gutter, maxWidth } = useLayout();
  const bottom = useBottomInset();
  return (
    <ScrollView keyboardShouldPersistTaps={keyboardShouldPersistTaps} contentContainerStyle={{ alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth, paddingHorizontal: gutter, paddingTop: space.md, paddingBottom: space.xl + bottom + bottomExtra }}>{children}</View>
    </ScrollView>
  );
}

export function AppText({ children, variant = 'body', style, color, ...rest }: React.ComponentProps<typeof Text> & {
  variant?: 'display' | 'title' | 'stat' | 'heading' | 'body' | 'caption' | 'label'; color?: string;
}) {
  const { colors } = useTheme();
  const muted = variant === 'caption' || variant === 'label';
  const big = variant === 'display' || variant === 'title' || variant === 'stat';
  return <Text {...rest} maxFontSizeMultiplier={rest.maxFontSizeMultiplier ?? (big ? 1.3 : undefined)} accessibilityRole={rest.accessibilityRole ?? (variant === 'title' || variant === 'display' ? 'header' : undefined)}
    style={[{ color: color ?? (muted ? colors.textMuted : colors.text) }, type[variant] as TextStyle, style]}>{children}</Text>;
}

type CardTone = 'default' | 'hero' | SubjectKeyDs | 'accent';
export function Card({ children, style, onPress, accessibilityLabel, tone = 'default' }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string; tone?: CardTone;
}) {
  const { colors } = useTheme();
  const bg = tone === 'hero' ? colors.primary : tone === 'accent' ? colors.accent : tone === 'default' ? colors.surface : subjectTint(colors, tone);
  const s: ViewStyle = { backgroundColor: bg, borderColor: tone === 'default' ? colors.border : 'transparent', borderWidth: StyleSheet.hairlineWidth * 2, borderRadius: radius.lg, padding: space.md };
  if (!onPress) return <View style={[s, style]}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress}
      android_ripple={{ color: colors.border, foreground: true }} style={({ pressed }) => [s, { opacity: pressed ? 0.88 : 1 }, style]}>{children}</Pressable>
  );
}

export function Button({ title, onPress, variant = 'primary', disabled, loading, style, icon, accessibilityHint }: {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean; loading?: boolean;
  style?: StyleProp<ViewStyle>; icon?: IconName; accessibilityHint?: string;
}) {
  const { colors } = useTheme();
  const bg = variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.accent : 'transparent';
  const fg = variant === 'primary' ? colors.onPrimary : variant === 'secondary' ? colors.onAccent : colors.accentStrong;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={accessibilityHint} accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading} onPress={onPress} android_ripple={{ color: fg + '33' }}
      style={({ pressed }) => [{ minHeight: MIN_TOUCH, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: bg,
        alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space.sm, opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        borderWidth: disabled && variant !== 'ghost' ? 1 : 0, borderColor: colors.controlBorder }, style]}>
      {loading ? <Spinner color={fg} /> : icon ? <Icon name={icon} size="md" color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 16, lineHeight: 22, fontWeight: '600', flexShrink: 1, textAlign: 'center' }}>{title}</Text>
    </Pressable>
  );
}

function Spinner({ color }: { color: string }) {
  return <ActivityIndicator color={color} />;
}

/** Selected state shows a check mark as well as colour, so colour is never the only signal. */
export function Chip({ label, selected, onPress, color }: { label: string; selected?: boolean; onPress?: () => void; color?: string }) {
  const { colors } = useTheme();
  const bg = selected ? (color ?? colors.primary) : colors.surfaceAlt;
  const fg = selected ? colors.onPrimary : colors.text;
  const body = (
    <View style={{ minHeight: 36, paddingHorizontal: space.md, borderRadius: radius.pill, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: space.xs, backgroundColor: bg,
      borderWidth: selected ? 0 : 1, borderColor: colors.border }}>
      {selected && onPress ? <Icon name="checkmark" size="sm" color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{label}</Text>
    </View>
  );
  if (!onPress) return body;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: !!selected }} onPress={onPress} hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}>{body}</Pressable>;
}

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent' }) {
  const { colors } = useTheme();
  const map = {
    neutral: [colors.surfaceAlt, colors.textMuted], success: [colors.successTint, colors.success], warning: [colors.warningTint, colors.warning],
    danger: [colors.dangerTint, colors.danger], accent: [colors.accent, colors.onAccent],
  } as const;
  return (
    <View style={{ alignSelf: 'flex-start', paddingHorizontal: space.sm, paddingVertical: space.xxs + 1, borderRadius: radius.sm, backgroundColor: map[tone][0] }}>
      <Text style={{ color: map[tone][1], fontSize: 12, lineHeight: 16, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function SubjectDot({ subject, size = 10 }: { subject: SubjectKeyDs; size?: number }) {
  const { colors } = useTheme();
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: subjectColor(colors, subject) }} />;
}

export function ProgressBar({ value, color, label }: { value: number | null; color?: string; label?: string }) {
  const { colors } = useTheme();
  const v = value === null ? 0 : Math.max(0, Math.min(1, value));
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={value === null ? { text: 'Not assessed' } : { min: 0, max: 100, now: Math.round(v * 100) }}
      style={{ height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden' }}>
      <View style={{ width: `${v * 100}%`, height: '100%', backgroundColor: color ?? colors.primary, borderRadius: 4 }} />
    </View>
  );
}

export function StatTile({ label, value, hint, tone = 'default', style }: { label: string; value: string; hint?: string; tone?: CardTone; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <Card tone={tone} style={[{ flexGrow: 1, flexShrink: 1, flexBasis: 140 }, style]}>
      <AppText variant="label" color={tone === 'hero' ? colors.accent : undefined}>{label}</AppText>
      <AppText variant="stat" color={tone === 'hero' ? colors.onPrimary : undefined} style={{ marginTop: space.xs }} accessibilityLabel={`${label}: ${value}`}>{value}</AppText>
      {hint ? <AppText variant="caption" color={tone === 'hero' ? colors.accent : undefined}>{hint}</AppText> : null}
    </Card>
  );
}

export function SectionHeader({ title, action, icon: ic }: { title: string; action?: { label: string; onPress: () => void }; icon?: IconName }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.lg, marginBottom: space.sm, minHeight: 32 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1 }}>
        {ic ? <Icon name={ic} size="md" color={colors.accentStrong} /> : null}
        <AppText variant="heading" accessibilityRole="header">{title}</AppText>
      </View>
      {action ? <Button variant="ghost" title={action.label} onPress={action.onPress} /> : null}
    </View>
  );
}

export function EmptyState({ title, body, action, icon: ic = 'albums-outline' }: { title: string; body: string; action?: { label: string; onPress: () => void }; icon?: IconName }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: space.lg, gap: space.sm }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={ic} size="lg" color={colors.onAccent} />
      </View>
      <AppText variant="heading" style={{ textAlign: 'center' }}>{title}</AppText>
      <AppText variant="body" color={colors.textMuted} style={{ textAlign: 'center' }}>{body}</AppText>
      {action ? <Button title={action.label} onPress={action.onPress} variant="secondary" /> : null}
    </View>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <View accessible accessibilityLabel={label} accessibilityRole="progressbar" style={{ padding: space.md, gap: space.md }}>
      <Skeleton height={28} width="60%" />
      <Skeleton height={120} />
      <Skeleton height={72} />
      <Skeleton height={72} />
    </View>
  );
}

/** Placeholder block; pulses gently unless the OS asks for reduced motion. */
export function Skeleton({ height, width = '100%' }: { height: number; width?: number | `${number}%` }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const o = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    if (reduced) { o.setValue(0.7); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0.55, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [reduced, o]);
  return <Animated.View importantForAccessibility="no-hide-descendants" style={{ height, width, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, opacity: o }} />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="alert" style={{ padding: space.lg, gap: space.sm, alignItems: 'center' }}>
      <Icon name="alert-circle-outline" size="lg" color={colors.danger} />
      <AppText variant="body" color={colors.danger} style={{ textAlign: 'center' }}>{message}</AppText>
      {onRetry ? <Button title="Try again" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

/** Gentle entrance (fade + 8px rise). Renders the final state immediately under reduced motion. */
export function FadeIn({ children, index = 0, style }: { children: React.ReactNode; index?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) { v.setValue(1); return; }
    Animated.timing(v, { toValue: 1, duration: motion.base, delay: Math.min(index, 6) * 50, useNativeDriver: true }).start();
  }, [reduced, index, v]);
  return <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }, style]}>{children}</Animated.View>;
}

/** Tappable tile with an icon for quick actions. */
export function ActionTile({ icon: ic, label, hint, onPress, tone = 'default' }: { icon: IconName; label: string; hint?: string; onPress: () => void; tone?: CardTone }) {
  const { colors } = useTheme();
  return (
    <Card tone={tone} onPress={onPress} accessibilityLabel={hint ? `${label}. ${hint}` : label} style={{ flexGrow: 1, flexShrink: 1, flexBasis: 150, minHeight: 88, justifyContent: 'center', gap: space.sm }}>
      <Icon name={ic} size="lg" color={colors.accentStrong} />
      <AppText variant="body" style={{ fontWeight: '600' }}>{label}</AppText>
      {hint ? <AppText variant="caption">{hint}</AppText> : null}
    </Card>
  );
}

/** Labelled text field: visible label (never placeholder-only), 3:1 border, clear focus ring, inline error. */
export function Field({ label, hint, error, value, onChangeText, multiline, placeholder, keyboardType, editable = true, minLines = 1, autoCapitalize, secureTextEntry, autoComplete, textContentType, autoCorrect, onSubmitEditing, returnKeyType }: {
  label: string; hint?: string; error?: string | null; value: string; onChangeText: (t: string) => void; multiline?: boolean;
  placeholder?: string; keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType']; editable?: boolean; minLines?: number;
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  secureTextEntry?: boolean; autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete']; textContentType?: React.ComponentProps<typeof TextInput>['textContentType'];
  autoCorrect?: boolean; onSubmitEditing?: () => void; returnKeyType?: React.ComponentProps<typeof TextInput>['returnKeyType'];
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ gap: space.xs }}>
      <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>{label}</AppText>
      <TextInput
        accessibilityLabel={label} accessibilityHint={hint} value={value} onChangeText={onChangeText} multiline={multiline} editable={editable}
        placeholder={placeholder} placeholderTextColor={colors.textMuted} keyboardType={keyboardType} autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry} autoComplete={autoComplete} textContentType={textContentType} autoCorrect={autoCorrect} onSubmitEditing={onSubmitEditing} returnKeyType={returnKeyType}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ minHeight: multiline ? Math.max(MIN_TOUCH, 24 * minLines + space.lg) : MIN_TOUCH, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm + 2,
          fontSize: 16, lineHeight: 22, color: colors.text, backgroundColor: editable ? colors.surface : colors.surfaceAlt, textAlignVertical: multiline ? 'top' : 'center',
          borderWidth: focused ? 2 : 1.5, borderColor: error ? colors.danger : focused ? colors.accentStrong : colors.controlBorder }}
      />
      {error ? (
        <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'center' }} accessibilityRole="alert">
          <Icon name="alert-circle" size="sm" color={colors.danger} /><AppText variant="caption" color={colors.danger}>{error}</AppText>
        </View>
      ) : hint ? <AppText variant="caption">{hint}</AppText> : null}
    </View>
  );
}

/** Grouped form section. */
export function Group({ title, children, tone = 'default' }: { title?: string; children: React.ReactNode; tone?: CardTone }) {
  return (
    <Card tone={tone} style={{ gap: space.md, marginBottom: space.md }}>
      {title ? <AppText variant="label">{title}</AppText> : null}
      {children}
    </Card>
  );
}
