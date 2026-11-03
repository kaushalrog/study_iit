import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, EmptyState, ErrorState, Icon, LoadingState, Page, SectionHeader, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { examRepo } from '../../src/database/repositories/exams';
import { mockRepo } from '../../src/database/repositories/mocks';
import { questionRepo } from '../../src/database/repositories/questions';
import { examMaxMarks } from '../../src/features/exam-engine/scoring';
import { startSession } from '../../src/features/exam-engine/session';
import { assemblePaper, buildTemplatePaper, shrinkToAvailable } from '../../src/features/practice/quiz';
import { useAsync } from '../../src/hooks/useAsync';
import { newId } from '../../src/utils/ids';

/** Build a timed mock from an exam pattern and the verified question bank, saying plainly what the bank cannot fill. */
export default function TemplateMock() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { data, error, reload } = useAsync(async () => {
    const config = await examRepo.templateConfig(db, id);
    const qs = await questionRepo.list(db);
    return { config, bank: questionRepo.toBank(qs), active: await mockRepo.loadActive(db) };
  }, [db, id]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const { config, bank } = data;
  if (!config || config.sections.length === 0) {
    return <EmptyState icon="construct-outline" title="This pattern has no sections yet" body="Enter the sections from your paper's instructions first."
      action={{ label: 'Edit pattern', onPress: () => router.replace({ pathname: '/exam/pattern', params: { id } }) }} />;
  }
  const { picked, shortfalls } = buildTemplatePaper(config, bank, Date.now() % 100000);
  const full = shortfalls.length === 0;
  const have = Object.values(picked).reduce((a, x) => a + x.length, 0);

  const start = async (shorter: boolean) => {
    setBusy(true); setErr(null);
    try {
      const cfg = shorter ? shrinkToAvailable(config, picked) : config;
      const keys = await questionRepo.keys(db, Object.values(picked).flat().map((q) => q.id));
      const paper = assemblePaper(cfg, picked, keys);
      if (paper.questions.length === 0) throw new Error('The bank has no matching questions.');
      await mockRepo.saveActive(db, {
        id: newId(), name: cfg.name, mode: 'timed', config: cfg, questions: paper.questions,
        session: startSession(paper.questions.map((q) => q.id), Date.now(), cfg.durationMinutes ? cfg.durationMinutes * 60_000 : null), checked: [], hintUsed: [],
      });
      router.replace('/quiz/run');
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not start'); setBusy(false); }
  };

  return (
    <Page>
      <AppText variant="display">{config.name}</AppText>
      <AppText variant="caption" style={{ marginBottom: space.md }}>
        {config.durationMinutes ? `${config.durationMinutes} minutes` : 'Untimed'} · {config.negativeMarkingEnabled ? 'negative marking' : 'no negative marking'} · {examMaxMarks(config)} marks in the full pattern
      </AppText>
      {data.active && <Card style={{ marginBottom: space.md }}><AppText variant="body">You have an unfinished test. Starting a new one discards it.</AppText>
        <Button title="Resume it instead" variant="secondary" icon="play" onPress={() => router.replace('/quiz/run')} style={{ marginTop: space.sm }} /></Card>}

      <SectionHeader title="Your question bank against this pattern" />
      {config.sections.map((s) => {
        const n = picked[s.id]?.length ?? 0;
        const ok = n >= s.questionCount;
        return (
          <Card key={s.id} style={{ marginBottom: space.sm, flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            <Icon name={ok ? 'checkmark-circle' : 'alert-circle'} size="md" color={ok ? colors.success : colors.warning} />
            <View style={{ flex: 1 }}>
              <AppText variant="body">{s.name}</AppText>
              <AppText variant="caption">{ok ? `${s.questionCount} questions ready` : `${n} of ${s.questionCount} verified ${s.subject} ${s.questionType} questions in your bank`}</AppText>
            </View>
          </Card>
        );
      })}
      {!full && <AppText variant="caption" style={{ marginBottom: space.md }}>ORBIT never makes up questions. Add and verify more, or take a shorter paper with the same marking.</AppText>}

      {err ? <AppText variant="body" color={colors.danger} accessibilityRole="alert" style={{ marginBottom: space.sm }}>{err}</AppText> : null}
      <View style={{ gap: space.sm }}>
        {full && <Button title="Start the full paper" icon="play" onPress={() => start(false)} loading={busy} />}
        {!full && have > 0 && <Button title={`Start a shorter paper (${have} questions)`} icon="play" onPress={() => start(true)} loading={busy} />}
        {!full && <Button title="Add a question" variant="secondary" icon="add-circle-outline" onPress={() => router.push('/question/new')} />}
        <Button title="Edit pattern" variant="ghost" icon="create-outline" onPress={() => router.push({ pathname: '/exam/pattern', params: { id } })} />
      </View>
    </Page>
  );
}
