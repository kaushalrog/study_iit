import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText, Button, Icon, MIN_TOUCH, SubjectDot, Tag, space, useTheme } from '../design-system';
import type { PersistedTask } from '../../database/repositories/planner';

const compact = { paddingHorizontal: 8 } as const;
const mmss = (ms: number) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

/** One task in today's plan. The tick is a real 48dp button; timing and "tomorrow" are optional. */
export function PlanTaskRow({ t, running, elapsedMs, last, onToggleDone, onStart, onStop, onLater, onOpen }: {
  t: PersistedTask; running: boolean; elapsedMs: number; last: boolean;
  onToggleDone: () => void; onStart: () => void; onStop: () => void; onLater: () => void; onOpen?: () => void;
}) {
  const { colors } = useTheme();
  const done = t.status === 'done';
  const moved = t.status === 'rescheduled';
  const label = `${t.startTime} to ${t.endTime}. ${t.title}. ${done ? 'Done' : moved ? 'Moved to tomorrow' : 'Not done'}.`;
  return (
    <View style={{ flexDirection: 'row', gap: space.sm, paddingTop: space.md, opacity: moved ? 0.65 : 1 }}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={`${t.title}, mark ${done ? 'not done' : 'done'}`} onPress={onToggleDone}
        hitSlop={4} style={{ width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: done ? colors.success : colors.controlBorder, backgroundColor: done ? colors.success : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {done ? <Icon name="checkmark" size="sm" color={colors.bg} /> : null}
        </View>
      </Pressable>
      <View style={{ flex: 1, gap: space.xs }} accessible={false}>
        <Pressable disabled={!onOpen} onPress={onOpen} accessibilityRole={onOpen ? 'button' : undefined} accessibilityLabel={label}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
            {t.subject ? <SubjectDot subject={t.subject} /> : null}
            <AppText variant="caption">{t.startTime}–{t.endTime} · {t.plannedMinutes} min</AppText>
          </View>
          <AppText variant="body" style={{ fontWeight: '600', textDecorationLine: done ? 'line-through' : 'none', color: done ? colors.textMuted : colors.text }}>{t.title}</AppText>
          {t.detail ? <AppText variant="caption">{t.detail}</AppText> : null}
        </Pressable>
        <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
          {t.difficulty ? <Tag tone="accent" label={t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1)} /> : null}
          {t.external ? <Tag label="From school" /> : null}
          {t.needsSetup ? <Tag tone="warning" label="Needs content" /> : null}
          {moved ? <Tag label="Moved to tomorrow" /> : null}
          {t.actualMinutes > 0 ? <Tag tone="success" label={`${t.actualMinutes} min studied`} /> : null}
        </View>
        {!done && !moved && (
          <View style={{ flexDirection: 'row', gap: 0, flexWrap: 'wrap', marginLeft: -8 }}>
            {running
              ? <Button variant="secondary" icon="stop-circle-outline" title={`Stop · ${mmss(elapsedMs)}`} onPress={onStop} style={compact} />
              : <Button variant="ghost" icon="play-circle-outline" title="Start timer" onPress={onStart} style={compact} />}
            {!t.external && !running ? <Button variant="ghost" icon="arrow-redo-outline" title="Tomorrow" onPress={onLater} style={compact} accessibilityHint="Moves this to tomorrow without adding extra work" /> : null}
          </View>
        )}
      </View>
    </View>
  );
}
