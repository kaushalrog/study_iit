import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { QuestionType, Response } from '../../features/exam-engine/types';
import { AppText, Field, Icon, MIN_TOUCH, radius, space, useTheme } from './index';

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Options never rely on colour alone: picked / correct / wrong each also show an icon and a text label.
 */
export function AnswerInput({ type, options, value, onChange, locked, correct, revealCorrect }: {
  type: QuestionType; options: string[]; value: Response | undefined; onChange: (r: Response) => void;
  locked?: boolean; correct?: string[]; revealCorrect?: boolean;
}) {
  const { colors } = useTheme();

  if (type === 'integer') {
    return (
      <Field label="Your answer" hint="Enter a number" keyboardType="numbers-and-punctuation" editable={!locked}
        value={value?.numeric === undefined || value?.numeric === null ? '' : String(value.numeric)}
        onChangeText={(t) => {
          const cleaned = t.replace(/[^0-9.\-]/g, '');
          if (cleaned === '' || cleaned === '-' || cleaned === '.') return onChange({ numeric: null });
          const n = Number(cleaned);
          if (Number.isFinite(n)) onChange({ numeric: n });
        }} />
    );
  }

  const multi = type === 'multi';
  const picked = value?.selected ?? [];
  const toggle = (k: string) => {
    if (locked) return;
    if (!multi) return onChange({ selected: [k] });
    onChange({ selected: picked.includes(k) ? picked.filter((x) => x !== k) : [...picked, k].sort() });
  };

  return (
    <View style={{ gap: space.sm }} accessibilityRole={multi ? 'none' : 'radiogroup'}>
      {multi && <AppText variant="caption">Select all that apply</AppText>}
      {options.map((text, i) => {
        const k = KEYS[i];
        const isPicked = picked.includes(k);
        const isCorrect = !!revealCorrect && !!correct?.includes(k);
        const isWrongPick = !!revealCorrect && isPicked && !correct?.includes(k);
        const bg = isCorrect ? colors.successTint : isWrongPick ? colors.dangerTint : isPicked ? colors.accent : colors.surface;
        const edge = isCorrect ? colors.success : isWrongPick ? colors.danger : isPicked ? colors.accentStrong : colors.controlBorder;
        const status = isCorrect ? 'Correct answer' : isWrongPick ? 'Your answer, not correct' : isPicked ? 'Selected' : '';
        return (
          <Pressable
            key={k} onPress={() => toggle(k)} accessibilityRole={multi ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: isPicked, disabled: !!locked }} accessibilityLabel={`Option ${k}: ${text}${status ? '. ' + status : ''}`}
            android_ripple={locked ? undefined : { color: colors.border }}
            style={{ minHeight: MIN_TOUCH + 8, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: bg,
              borderWidth: isPicked || isCorrect ? 2 : 1.5, borderColor: edge }}>
            <View style={{ width: 32, height: 32, borderRadius: multi ? 8 : 16, borderWidth: 2, borderColor: edge, alignItems: 'center', justifyContent: 'center',
              backgroundColor: isPicked || isCorrect ? edge : 'transparent' }}>
              <Text style={{ color: isPicked || isCorrect ? colors.bg : colors.text, fontWeight: '700', fontSize: 14 }}>{k}</Text>
            </View>
            <AppText variant="body" style={{ flex: 1 }}>{text}</AppText>
            {isCorrect ? <View style={{ alignItems: 'center' }}><Icon name="checkmark-circle" size="md" color={colors.success} /><AppText variant="caption" color={colors.success}>Correct</AppText></View>
              : isWrongPick ? <View style={{ alignItems: 'center' }}><Icon name="close-circle" size="md" color={colors.danger} /><AppText variant="caption" color={colors.danger}>Yours</AppText></View>
              : isPicked ? <Icon name="checkmark" size="md" color={colors.accentStrong} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
