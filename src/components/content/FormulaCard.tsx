import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, Tag, space, useTheme } from '../design-system';
import type { FormulaRow } from '../../database/repositories/content';
import { latexToReadable, richToReadable } from '../../features/syllabus/math';

/** A formula as a student wants to read it: big readable maths, what each symbol means, when it applies. Raw LaTeX on demand. */
export function FormulaCard({ f, onDelete }: { f: FormulaRow; onDelete?: () => void }) {
  const { colors } = useTheme();
  const [raw, setRaw] = useState(false);
  const verified = f.verification === 'verified' || f.verification === 'published';
  const readable = latexToReadable(f.latex);
  return (
    <Card style={{ gap: space.sm, marginBottom: space.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.sm }}>
        <AppText variant="heading" style={{ flex: 1 }}>{f.name}</AppText>
        <Tag tone={verified ? 'success' : 'warning'} label={verified ? 'Verified' : 'Not yet verified'} />
      </View>
      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: space.md }}
        accessible accessibilityLabel={`Formula: ${readable}`}>
        <AppText variant="title" selectable style={{ flexShrink: 1 }}>{readable}</AppText>
        {raw ? <AppText variant="caption" selectable style={{ marginTop: space.sm, fontFamily: 'monospace' }}>{f.latex}</AppText> : null}
      </View>
      {f.variables.length > 0 && (
        <View style={{ gap: space.xs }}>
          <AppText variant="label">Where</AppText>
          {f.variables.map((v, i) => (
            <View key={`${v.symbol}-${i}`} style={{ flexDirection: 'row', gap: space.sm }}>
              <AppText variant="body" style={{ fontWeight: '700', minWidth: 28 }}>{latexToReadable(v.symbol)}</AppText>
              <AppText variant="body" style={{ flex: 1 }}>{v.meaning}{v.unit ? ` (${latexToReadable(v.unit)})` : ''}</AppText>
            </View>
          ))}
        </View>
      )}
      {f.conditions ? <AppText variant="body"><AppText variant="body" style={{ fontWeight: '700' }}>Valid when: </AppText>{richToReadable(f.conditions)}</AppText> : null}
      {f.explanation ? <AppText variant="body">{richToReadable(f.explanation)}</AppText> : null}
      {f.example ? <AppText variant="body"><AppText variant="body" style={{ fontWeight: '700' }}>Example: </AppText>{richToReadable(f.example)}</AppText> : null}
      {f.sourceNote ? <AppText variant="caption">Source: {f.sourceNote}</AppText> : null}
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Button variant="ghost" icon="code-slash-outline" title={raw ? 'Hide LaTeX' : 'Show LaTeX'} onPress={() => setRaw(!raw)} />
        {onDelete ? <Button variant="ghost" icon="trash-outline" title="Delete" onPress={onDelete} /> : null}
      </View>
    </Card>
  );
}
