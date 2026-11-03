import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, Chip, EmptyState, ErrorState, Group, Icon, LoadingState, Page, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { mockRepo } from '../../src/database/repositories/mocks';
import { questionRepo } from '../../src/database/repositories/questions';
import { startSession } from '../../src/features/exam-engine/session';
import { buildCustomExam, Difficulty, selectQuestions } from '../../src/features/practice/quiz';
import { useAsync } from '../../src/hooks/useAsync';
import { newId } from '../../src/utils/ids';

type Level = Difficulty | 'progressive';
const L = (s: string) => <AppText variant="caption" style={{ fontWeight: '600' }}>{s}</AppText>;

export default function QuizSetup() {
  const params = useLocalSearchParams<{ mode?: 'practice' | 'timed'; chapterId?: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const timed = params.mode === 'timed';

  const { data, error, reload } = useAsync(async () => ({ qs: await questionRepo.list(db), active: await mockRepo.loadActive(db) }), [db]);

  const [picked, setPicked] = useState<string[] | null>(null);
  const [level, setLevel] = useState<Level>('progressive');
  const [count, setCount] = useState(10);
  const [minutes, setMinutes] = useState(30);
  const [correctMarks, setCorrectMarks] = useState(4);
  const [wrongMarks, setWrongMarks] = useState(-1);
  const [partial, setPartial] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const chapters = useMemo(() => {
    const m = new Map<string, { id: string; title: string; subject: 'math' | 'physics' | 'chemistry'; n: number }>();
    for (const q of data?.qs ?? []) { const c = m.get(q.chapterId) ?? { id: q.chapterId, title: q.chapterTitle, subject: q.subject, n: 0 }; c.n++; m.set(q.chapterId, c); }
    return Array.from(m.values());
  }, [data]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  if (data.qs.length === 0) {
    return <EmptyState icon="help-circle-outline" title="No verified questions yet" body="Add questions from your coaching papers first, and confirm their answer keys." action={{ label: 'Add a question', onPress: () => router.replace('/question/new') }} />;
  }

  const chosen = picked ?? (params.chapterId && chapters.some((c) => c.id === params.chapterId) ? [params.chapterId] : chapters.map((c) => c.id));
  const bank = questionRepo.toBank(data.qs);
  const available = selectQuestions(bank, { count: 999, chapterIds: chosen, difficulty: level === 'progressive' ? undefined : level }).length;
  const n = Math.min(count, available);

  const start = async () => {
    setBusy(true); setErr(null);
    try {
      const sel = selectQuestions(bank, { count: n, chapterIds: chosen, difficulty: level === 'progressive' ? undefined : level, progressive: level === 'progressive', seed: Date.now() % 100000 });
      if (sel.length === 0) throw new Error('No questions match these choices.');
      const keys = await questionRepo.keys(db, sel.map((q) => q.id));
      const name = timed ? 'Timed test' : 'Practice';
      const { config, questions } = buildCustomExam(name, sel, keys, { correct: correctMarks, incorrect: wrongMarks, partialPerCorrectOption: partial ? 1 : null }, timed ? minutes : null);
      await mockRepo.saveActive(db, {
        id: newId(), name, mode: timed ? 'timed' : 'practice', config, questions,
        session: startSession(questions.map((q) => q.id), Date.now(), timed ? minutes * 60_000 : null), checked: [], hintUsed: [],
      });
      router.replace('/quiz/run');
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not start'); setBusy(false); }
  };

  const chips = (xs: number[], cur: number, set: (n: number) => void, fmt: (n: number) => string = String) => (
    <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>{xs.map((x) => <Chip key={x} label={fmt(x)} selected={cur === x} onPress={() => set(x)} />)}</View>
  );

  return (
    <Page>
      {data.active && (
        <Card tone="accent" style={{ marginBottom: space.md, gap: space.sm }}>
          <AppText variant="body" color={colors.onAccent}>You have an unfinished {data.active.mode === 'timed' ? 'timed test' : 'practice set'}. Starting a new one discards it.</AppText>
          <Button title="Resume it instead" variant="secondary" icon="play" onPress={() => router.replace('/quiz/run')} />
        </Card>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Icon name={timed ? 'timer-outline' : 'bulb-outline'} size="lg" color={colors.accentStrong} />
        <AppText variant="display">{timed ? 'Timed test' : 'Practice'}</AppText>
      </View>
      <AppText variant="caption" style={{ marginBottom: space.md }}>{timed ? 'No hints or feedback until you submit, like a real paper.' : 'Hints and instant feedback after each question.'}</AppText>

      <Group title="What to cover">
        {L('Chapters')}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {chapters.map((c) => (
            <Chip key={c.id} label={`${c.title} (${c.n})`} color={colors[c.subject]} selected={chosen.includes(c.id)}
              onPress={() => setPicked(chosen.includes(c.id) ? chosen.filter((x) => x !== c.id) : [...chosen, c.id])} />
          ))}
        </View>
        {L('Level')}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {([['progressive', 'Easy to hard'], ['foundation', 'Foundation'], ['main', 'Main'], ['advanced', 'Advanced']] as const).map(([l, t]) => (
            <Chip key={l} label={t} selected={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>
        {L(`Number of questions (${available} available)`)}
        {chips([5, 10, 15, 20, 30], count, setCount)}
        {timed && (<>{L('Time in minutes')}{chips([10, 20, 30, 45, 60], minutes, setMinutes)}</>)}
      </Group>

      <Group title="Marking. Your own setting, not an official pattern">
        {L('Marks for a correct answer')}
        {chips([1, 2, 3, 4], correctMarks, setCorrectMarks, (m) => `+${m}`)}
        {L('Marks for a wrong answer')}
        {chips([0, -1, -2], wrongMarks, setWrongMarks)}
        {L('Partial marks for multiple-correct questions')}
        <View style={{ flexDirection: 'row' }}><Chip label={partial ? 'On' : 'Off'} selected={partial} onPress={() => setPartial(!partial)} /></View>
      </Group>

      {err ? <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.sm }}><Icon name="alert-circle" size="md" color={colors.danger} /><AppText variant="body" color={colors.danger} accessibilityRole="alert" style={{ flex: 1 }}>{err}</AppText></View> : null}
      <Button title={`Start ${n} question${n === 1 ? '' : 's'}`} icon="play" onPress={start} loading={busy} disabled={n === 0} />
    </Page>
  );
}
