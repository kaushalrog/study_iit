import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, ErrorState, Field, Icon, LoadingState, Page, SubjectDot, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { examRepo, manualResultSchema } from '../../src/database/repositories/exams';
import { useAsync } from '../../src/hooks/useAsync';

const SUBJECTS = [['math', 'Mathematics'], ['physics', 'Physics'], ['chemistry', 'Chemistry']] as const;

export default function RecordResult() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [maxes, setMaxes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const { data: exam, error: loadErr, loading, reload } = useAsync(async () => (await examRepo.list(db)).find((e) => e.id === examId) ?? null, [db, examId]);
  const parsed = useMemo(() => {
    const subjects = SUBJECTS.filter(([k]) => marks[k] !== undefined && marks[k] !== '' && maxes[k] !== undefined && maxes[k] !== '')
      .map(([k]) => ({ subject: k, marks: Number(marks[k]), maxMarks: Number(maxes[k]) }));
    return manualResultSchema.safeParse({ examId, subjects });
  }, [marks, maxes, examId]);

  if (loadErr) return <ErrorState message={loadErr} onRetry={reload} />;
  if (!exam) return loading ? <LoadingState /> : <ErrorState message="Exam not found." />;

  const save = async () => {
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check the numbers.'); return; }
    try { await examRepo.saveManualResult(db, parsed.data); router.back(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save'); }
  };

  const total = parsed.success ? parsed.data.subjects.reduce((a, s) => a + s.marks, 0) : null;
  const max = parsed.success ? parsed.data.subjects.reduce((a, s) => a + s.maxMarks, 0) : null;
  const clean = (t: string) => t.replace(/[^0-9.\-]/g, '');

  return (
    <Page keyboardShouldPersistTaps="handled">
      <AppText variant="title">{exam.name}</AppText>
      <AppText variant="caption" style={{ marginBottom: space.md }}>Enter each subject's marks and its maximum, exactly as printed on the result sheet.</AppText>
      {SUBJECTS.map(([k, name]) => (
        <Card key={k} tone={k} style={{ marginBottom: space.sm, gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}><SubjectDot subject={k} size={12} /><AppText variant="heading" color={colors[k]}>{name}</AppText></View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <View style={{ flex: 1 }}><Field label="Marks" keyboardType="numeric" value={marks[k] ?? ''} onChangeText={(t) => setMarks((p) => ({ ...p, [k]: clean(t) }))} /></View>
            <View style={{ flex: 1 }}><Field label="Out of" keyboardType="numeric" value={maxes[k] ?? ''} onChangeText={(t) => setMaxes((p) => ({ ...p, [k]: clean(t) }))} /></View>
          </View>
        </Card>
      ))}
      {total !== null && (
        <Card tone="hero" style={{ marginTop: space.sm }}>
          <AppText variant="label" color={colors.accent}>Total</AppText>
          <AppText variant="stat" color={colors.onPrimary}>{total} / {max}</AppText>
        </Card>
      )}
      {error ? <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}><Icon name="alert-circle" size="md" color={colors.danger} /><AppText variant="body" color={colors.danger} accessibilityRole="alert" style={{ flex: 1 }}>{error}</AppText></View> : null}
      {!confirming ? (
        <Button title="Review and save" icon="eye-outline" disabled={!parsed.success} onPress={() => { setError(null); setConfirming(true); }} style={{ marginTop: space.md }} />
      ) : (
        <Card tone="accent" style={{ marginTop: space.md }}>
          <AppText variant="body" color={colors.onAccent}>Save {total} / {max} as the result for {exam.name}? Please check it against the result sheet.</AppText>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
            <Button title="Edit" variant="ghost" onPress={() => setConfirming(false)} style={{ flex: 1 }} />
            <Button title="Confirm and save" onPress={save} style={{ flex: 1 }} />
          </View>
        </Card>
      )}
    </Page>
  );
}
