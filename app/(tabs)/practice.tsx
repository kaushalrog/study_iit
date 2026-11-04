import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { AppText, Button, Card, Chip, EmptyState, ErrorState, LoadingState, SectionHeader, space, Page } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { examRepo } from '../../src/database/repositories/exams';
import { mockRepo } from '../../src/database/repositories/mocks';
import { questionRepo } from '../../src/database/repositories/questions';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { useContentSync } from '../../src/services/content/ContentSyncProvider';
import { useAsync } from '../../src/hooks/useAsync';
import { diffDays, toDateKey } from '../../src/utils/dates';

export default function Practice() {
  const db = useDb();
  const router = useRouter();
  const content = useContentSync();
  const { data, error, reload } = useAsync(async () => {
    const [exams, chapters, active, history, unverified] = await Promise.all([
      examRepo.list(db), syllabusRepo.chapters(db), mockRepo.loadActive(db), mockRepo.history(db), questionRepo.unverifiedCount(db),
    ]);
    const configs = await Promise.all(exams.map(async (e) => (e.templateId ? examRepo.templateConfig(db, e.templateId) : null)));
    return { exams: exams.map((e, i) => ({ ...e, config: configs[i] })), questions: chapters.reduce((a, c) => a + c.questionCount, 0), active, history, unverified };
  }, [db, content.contentVersion]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const today = toDateKey(new Date());
  const a0 = data.active?.session;
  const timeUp = !!a0 && a0.durationMs !== null && a0.finishedAt === null && Date.now() >= a0.startedAt + a0.durationMs;

  return (
    <Page>
      {data.active && (
        <Card style={{ marginBottom: space.sm }}>
          <AppText variant="heading">{timeUp ? 'Time ran out on your timed test' : `Unfinished ${data.active.mode === 'timed' ? 'timed test' : 'practice'}`}</AppText>
          <AppText variant="caption">{data.active.questions.length} question{data.active.questions.length === 1 ? '' : 's'} · {timeUp ? 'Open it to submit your saved answers.' : 'your answers are saved.'}</AppText>
          <Button title={timeUp ? 'See result' : 'Resume'} icon="play" onPress={() => router.push('/quiz/run')} style={{ marginTop: space.sm }} />
        </Card>
      )}

      <SectionHeader title="Question bank" />
      {data.questions === 0 ? (
        <EmptyState title="No verified questions yet"
          body="Add questions from your coaching papers and confirm their answer keys. AI-generated questions will stay separate and labelled until you verify them."
          action={{ label: 'Add a question', onPress: () => router.push('/question/new') }} />
      ) : (
        <Card>
          <AppText variant="body">{data.questions} verified question{data.questions === 1 ? '' : 's'} ready.</AppText>
          <View style={{ gap: space.sm, marginTop: space.sm }}>
            <Button title="Practice with hints" icon="bulb-outline" onPress={() => router.push({ pathname: '/quiz/setup', params: { mode: 'practice' } })} />
            <Button title="Timed test" icon="timer-outline" variant="secondary" onPress={() => router.push({ pathname: '/quiz/setup', params: { mode: 'timed' } })} />
            <Button title="Add a question" icon="add-circle-outline" variant="ghost" onPress={() => router.push('/question/new')} />
          </View>
        </Card>
      )}
      {data.unverified > 0 && <AppText variant="caption" style={{ marginTop: space.sm }}>{data.unverified} question{data.unverified === 1 ? ' is' : 's are'} waiting for answer-key confirmation and are not used in practice.</AppText>}

      {data.history.length > 0 && (<>
        <SectionHeader title="Recent tests" />
        {data.history.slice(0, 5).map((h) => (
          <Card key={h.id} style={{ marginBottom: space.sm }}>
            <AppText variant="body">{h.name} · {h.total_marks} / {h.max_marks} ({Math.round(h.percentage)}% of marks, {Math.round(h.accuracy)}% accuracy)</AppText>
            <AppText variant="caption">{new Date(h.finished_at).toLocaleString()}</AppText>
          </Card>
        ))}
      </>)}

      <SectionHeader title="Exams" />
      {data.exams.map((e) => {
        const days = diffDays(today, e.examDate);
        const sections = e.config?.sections.length ?? 0;
        return (
          <Card key={e.id} style={{ marginBottom: space.sm }}>
            <AppText variant="heading">{e.name}</AppText>
            <AppText variant="caption">{new Date(e.examDate + 'T00:00:00').toDateString()} · {days > 0 ? `in ${days} days` : days === 0 ? 'today' : `${-days} days ago`}</AppText>
            <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' }}>
              <Chip label={e.status} />
              <Chip label={sections ? `${sections} sections` : 'Pattern needs setup'} />
              {e.config && <Chip label={e.config.negativeMarkingEnabled ? 'Negative marking on' : 'No negative marking'} />}
              {e.config && e.templateId && sections > 0 && <Chip label="Unverified pattern" />}
            </View>
            {e.status === 'completed' && e.totalScore !== null ? (
              <AppText variant="body" style={{ marginTop: space.sm }}>Scored {e.totalScore} / {e.maxScore}</AppText>
            ) : null}
            {e.templateId && (
              <View style={{ gap: space.sm, marginTop: space.sm }}>
                <Button title="Edit pattern" icon="options-outline" variant="secondary" onPress={() => router.push({ pathname: '/exam/pattern', params: { id: e.templateId! } })} />
                {sections > 0 && <Button title="Take a timed mock" icon="timer-outline" onPress={() => router.push({ pathname: '/exam/mock', params: { id: e.templateId! } })} />}
              </View>
            )}
            <Button variant="secondary" icon="create-outline" title={e.status === 'completed' ? 'Edit recorded result' : 'Record result'} style={{ marginTop: space.sm }}
              onPress={() => router.push({ pathname: '/result/[examId]', params: { examId: e.id } })} />
          </Card>
        );
      })}
      <AppText variant="caption">Official exam patterns need a confirmed marking scheme. Timed tests here use marking you choose, and real exam marks are recorded manually.</AppText>
    </Page>
  );
}
