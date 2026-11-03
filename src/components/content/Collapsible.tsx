import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppText, Card, Icon, MIN_TOUCH, space, useTheme } from '../design-system';

/** A lesson section that opens and closes. No animation, so it is already fine under reduced motion. */
export function Collapsible({ title, badge, defaultOpen = false, tone, children }: {
  title: string; badge?: React.ReactNode; defaultOpen?: boolean; tone?: 'math' | 'physics' | 'chemistry' | 'default'; children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card tone={tone ?? 'default'} style={{ marginBottom: space.sm, padding: 0, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${title}, ${open ? 'expanded' : 'collapsed'}`}
        onPress={() => setOpen(!open)} android_ripple={{ color: colors.border }}
        style={{ minHeight: MIN_TOUCH + 8, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          <AppText variant="heading">{title}</AppText>
          {badge}
        </View>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size="md" color={colors.textMuted} />
      </Pressable>
      {open ? <View style={{ paddingHorizontal: space.md, paddingBottom: space.md, gap: space.sm }}>{children}</View> : null}
    </Card>
  );
}
