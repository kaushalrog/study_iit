import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUpdateGuard } from '../../src/services/updates/UpdateProvider';
import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { AppText, Button, Card, Chip, ErrorState, Field, Group, LoadingState, Page, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { contentRepo, newFormulaSchema } from '../../src/database/repositories/content';
import { latexToReadable } from '../../src/features/syllabus/math';
import { useAsync } from '../../src/hooks/useAsync';

interface Row { symbol: string; meaning: string; unit: string }

export default function FormulaEditor() {
  const { chapterId, topicId } = useLocalSearchParams<{ chapterId: string; topicId?: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const { data, error, reload } = useAsync(() => contentRepo.topics(db, chapterId), [db, chapterId]);
  const [topic, setTopic] = useState<string | null>(topicId && topicId !== 'overview' ? topicId : null);
  const [name, setName] = useState('');
  useUpdateGuard('an unsaved formula', !!name.trim());
  const [latex, setLatex] = useState('');
  const [rows, setRows] = useState<Row[]>([{ symbol: '', meaning: '', unit: '' }]);
  const [conditions, setConditions] = useState('');
  const [explanation, setExplanation] = useState('');
  const [example, setExample] = useState('');
  const [source, setSource] = useState('');
  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;

  const setRow = (i: number, k: keyof Row, v: string) => setRows((p) => p.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const save = async () => {
    const variables = rows.filter((r) => r.symbol.trim() && r.meaning.trim()).map((r) => ({ symbol: r.symbol.trim(), meaning: r.meaning.trim(), unit: r.unit.trim() || undefined }));
    const input = { chapterId, topicId: topic, name, latex, variables, conditions, explanation, example, sourceNote: source, verified };
    const v = newFormulaSchema.safeParse(input);
    if (!v.success) { setMsg(v.error.issues[0].message); return; }
    try { await contentRepo.addFormula(db, input); router.back(); } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not save'); }
  };

  return (
    <Page keyboardShouldPersistTaps="handled">
      <Group title="The formula">
        <Field label="Name" placeholder="For example Law of gravitation" value={name} onChangeText={setName} />
        <Field label="Formula (LaTeX)" multiline minLines={2} autoCapitalize="none" value={latex} onChangeText={setLatex}
          hint="For example F = G \frac{m_1 m_2}{r^2}.  Powers: r^2.  Subscripts: m_1.  Roots: \sqrt{x}." />
        {latex.trim() ? (
          <View style={{ gap: space.xs }}>
            <AppText variant="label">How it will look</AppText>
            <Card tone="accent"><AppText variant="title" color={colors.onAccent} accessibilityLiveRegion="polite">{latexToReadable(latex)}</AppText></Card>
          </View>
        ) : null}
        {data.length > 0 && (
          <View style={{ gap: space.sm }}>
            <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Topic</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              <Chip label="Whole chapter" selected={topic === null} onPress={() => setTopic(null)} />
              {data.map((t) => <Chip key={t.id} label={t.title} selected={topic === t.id} onPress={() => setTopic(t.id)} />)}
            </View>
          </View>
        )}
      </Group>
      <Group title="What each symbol means">
        {rows.map((r, i) => (
          <View key={i} style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ width: 96 }}><Field label="Symbol" autoCapitalize="none" value={r.symbol} onChangeText={(t) => setRow(i, 'symbol', t)} /></View>
              <View style={{ flex: 1 }}><Field label="Meaning" value={r.meaning} onChangeText={(t) => setRow(i, 'meaning', t)} /></View>
            </View>
            <Field label="Unit (optional)" autoCapitalize="none" value={r.unit} onChangeText={(t) => setRow(i, 'unit', t)} />
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Button variant="ghost" icon="add" title="Add symbol" onPress={() => setRows((p) => [...p, { symbol: '', meaning: '', unit: '' }])} />
          {rows.length > 1 && <Button variant="ghost" icon="remove" title="Remove last" onPress={() => setRows((p) => p.slice(0, -1))} />}
        </View>
      </Group>
      <Group title="When and how">
        <Field label="Valid when (optional)" multiline value={conditions} onChangeText={setConditions} />
        <Field label="Explanation (optional)" multiline minLines={2} value={explanation} onChangeText={setExplanation} />
        <Field label="Example (optional)" multiline minLines={2} value={example} onChangeText={setExample} />
        <Field label="Source (optional)" value={source} onChangeText={setSource} />
      </Group>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md }}>
        <View style={{ flex: 1 }}>
          <AppText variant="body" style={{ fontWeight: '600' }}>I checked this formula against my book or teacher</AppText>
          <AppText variant="caption">Unchecked formulas still show, with a "Not yet verified" label.</AppText>
        </View>
        <Switch value={verified} onValueChange={setVerified} accessibilityLabel="Formula checked" trackColor={{ true: colors.accentStrong, false: colors.controlBorder }} />
      </Card>
      {msg ? <AppText variant="body" color={colors.danger} accessibilityRole="alert" style={{ marginBottom: space.sm }}>{msg}</AppText> : null}
      <Button title="Save formula" icon="save-outline" onPress={save} />
    </Page>
  );
}
