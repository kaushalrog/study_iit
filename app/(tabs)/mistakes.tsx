import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, Chip, EmptyState, ErrorState, FadeIn, Field, Icon, LoadingState, Page, ProgressBar, SectionHeader, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { CATEGORY_LABEL, MistakeRow, mistakeRepo } from '../../src/database/repositories/mistakes';
import { useAsync } from '../../src/hooks/useAsync';
import { toDateKey } from '../../src/utils/dates';

const SUBJECT_LABEL = { math: 'Maths', physics: 'Physics', chemistry: 'Chemistry' } as const;

export default function ErrorBook() {
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const today = toDateKey(new Date());
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState<keyof typeof SUBJECT_LABEL | undefined>();
  const [note, setNote] = useState<string | null>(null);

  const { data, error, reload } = useAsync(async () => {
    const [all, due, counts] = await Promise.all([
      mistakeRepo.list(db, { subject, search }), mistakeRepo.due(db, today), mistakeRepo.categoryCounts(db, subject),
    ]);
    return { all, due, counts };
  }, [db, subject, search, today]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;

  const review = async (m: MistakeRow, q: 'correct' | 'hesitant' | 'wrong') => {
    const next = await mistakeRepo.review(db, m.id, q, today);
    setNote(next.reviewConcept ? 'This one keeps tripping you up. Go back to the concept before trying again.' : `Next review in ${next.intervalDays} day${next.intervalDays === 1 ? '' : 's'}.`);
    reload();
  };

  return (
    <Page keyboardShouldPersistTaps="handled">
      <Button title="Add a mistake" icon="add-circle-outline" onPress={() => router.push('/mistake/new')} />
      <View style={{ marginTop: space.md, gap: space.sm }}>
        <Field label="Search" placeholder="Search questions and notes" value={search} onChangeText={setSearch} />
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Chip label="All subjects" selected={!subject} onPress={() => setSubject(undefined)} />
          {(['math', 'physics', 'chemistry'] as const).map((s) => (
            <Chip key={s} label={SUBJECT_LABEL[s]} selected={subject === s} color={colors[s]} onPress={() => setSubject(subject === s ? undefined : s)} />
          ))}
        </View>
      </View>
      {note ? <Card tone="accent" style={{ marginTop: space.md }}><AppText variant="body" color={colors.onAccent} accessibilityLiveRegion="polite">{note}</AppText></Card> : null}

      <SectionHeader title={`Due for revision (${data.due.length})`} icon="refresh-circle-outline" />
      {data.due.length === 0 ? (
        <Card><View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}><Icon name="checkmark-circle-outline" size="md" color={colors.success} /><AppText variant="body">Nothing due. Nice and steady.</AppText></View></Card>
      ) : data.due.slice(0, 5).map((m, i) => (
        <FadeIn key={m.id} index={i}>
          <Card tone={m.subject as 'math' | 'physics' | 'chemistry'} style={{ marginBottom: space.sm }}>
            <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
              <Tag label={m.chapterTitle ?? SUBJECT_LABEL[m.subject as keyof typeof SUBJECT_LABEL]} />
              <Tag tone={m.dueOn && m.dueOn < today ? 'warning' : 'neutral'} label={m.dueOn && m.dueOn < today ? `Overdue · ${m.dueOn}` : 'Due today'} />
              {m.reviewConcept && <Tag tone="danger" label="Revisit the concept first" />}
            </View>
            <AppText variant="body" style={{ marginTop: space.sm }}>{m.questionText}</AppText>
            {m.correctAnswer ? <AppText variant="caption" style={{ marginTop: space.xs }}>Answer: {m.correctAnswer}</AppText> : null}
            <AppText variant="caption" style={{ marginTop: space.md }}>How did that go?</AppText>
            <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xs, flexWrap: 'wrap' }}>
              <Button title="Got it" icon="checkmark" onPress={() => review(m, 'correct')} style={{ flexGrow: 1, flexBasis: 100 }} />
              <Button title="Unsure" variant="secondary" icon="help" onPress={() => review(m, 'hesitant')} style={{ flexGrow: 1, flexBasis: 100 }} />
              <Button title="Missed" variant="ghost" icon="close" onPress={() => review(m, 'wrong')} style={{ flexGrow: 1, flexBasis: 100 }} />
            </View>
          </Card>
        </FadeIn>
      ))}
      {data.due.length > 5 && <AppText variant="caption">{data.due.length - 5} more are waiting. Do five today; the rest can wait.</AppText>}

      {data.counts.length > 0 && (
        <>
          <SectionHeader title="Mistake types" icon="analytics-outline" />
          <Card style={{ gap: space.md }}>
            {data.counts.map((c) => (
              <View key={c.category} style={{ gap: space.xs }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText variant="body" style={{ flexShrink: 1 }}>{CATEGORY_LABEL[c.category]}</AppText>
                  <AppText variant="body" style={{ fontWeight: '700' }}>{c.n}</AppText>
                </View>
                <ProgressBar value={c.n / data.counts[0].n} color={colors.accentStrong} label={CATEGORY_LABEL[c.category]} />
              </View>
            ))}
          </Card>
        </>
      )}

      <SectionHeader title={`All mistakes (${data.all.length})`} icon="list-outline" />
      {data.all.length === 0 ? (
        <EmptyState icon="bookmark-outline" title={search || subject ? 'No matches' : 'Your Error Book is empty'}
          body={search || subject ? 'Try a different search or filter.' : 'Add a question you got wrong. ORBIT will schedule when to revisit it.'}
          action={search || subject ? undefined : { label: 'Add first mistake', onPress: () => router.push('/mistake/new') }} />
      ) : data.all.map((m) => (
        <Card key={m.id} style={{ marginBottom: space.sm }}>
          <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
            <Tag tone="accent" label={CATEGORY_LABEL[m.category]} />
            <Tag label={m.chapterTitle ?? SUBJECT_LABEL[m.subject as keyof typeof SUBJECT_LABEL]} />
          </View>
          <AppText variant="body" style={{ marginTop: space.sm }}>{m.questionText}</AppText>
          {m.dueOn ? <AppText variant="caption" style={{ marginTop: space.xs }}>Next review {m.dueOn}</AppText> : null}
        </Card>
      ))}
    </Page>
  );
}
