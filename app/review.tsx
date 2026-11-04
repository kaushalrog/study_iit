import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { AppText, Button, Card, Chip, EmptyState, ErrorState, LoadingState, Page, SectionHeader, Tag, space } from '../src/components/design-system';
import { useDb } from '../src/database/DatabaseProvider';
import { reviewRepo, ReviewItem, ReviewKind } from '../src/database/repositories/review';
import { syllabusRepo } from '../src/database/repositories/syllabus';
import { useAsync } from '../src/hooks/useAsync';

const KINDS: [ReviewKind, string][] = [['question', 'Questions'], ['lesson', 'Lessons'], ['formula', 'Formulas'], ['video', 'Videos']];
const PAGE = 15;

/** The checking desk. Material arrives "needs review"; only a person confirming it moves it into the verified library. */
export default function Review() {
  const params = useLocalSearchParams<{ chapterId?: string }>();
  const db = useDb();
  const [chapter, setChapter] = useState<string | null>(params.chapterId ?? null);
  const [kind, setKind] = useState<ReviewKind>('question');
  const [limit, setLimit] = useState(PAGE);
  const { data, error, reload } = useAsync(async () => {
    const chapters = await syllabusRepo.chapters(db);
    const cid = chapter ?? chapters[0]?.id ?? null;
    if (!cid) return { chapters, cid, counts: null, items: [] as ReviewItem[] };
    return { chapters, cid, counts: await reviewRepo.counts(db, cid), items: await reviewRepo.list(db, cid, kind, limit + 1) };
  }, [db, chapter, kind, limit]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const { chapters, cid, counts, items } = data;
  const more = items.length > limit;
  const shown = items.slice(0, limit);

  const confirm = (it: ReviewItem) => {
    const go = async () => { await reviewRepo.confirm(db, it.kind, it.id); reload(); };
    if (Platform.OS === 'web' || it.kind !== 'video') return go();
    Alert.alert('Have you opened and watched this video?', 'Confirm only if it teaches this topic correctly.', [{ text: 'Not yet', style: 'cancel' }, { text: 'Yes, confirm', onPress: go }]);
  };

  return (
    <Page>
      <AppText variant="caption" style={{ marginBottom: space.sm }}>Check each item against your book or teacher, then confirm it. Confirmed questions join practice and mastery; confirmed lessons lose the "Not yet verified" tag. Nothing is confirmed automatically.</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.sm }}>
        {chapters.map((c) => <Chip key={c.id} label={c.title} selected={c.id === cid} onPress={() => { setChapter(c.id); setLimit(PAGE); }} />)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.md }}>
        {KINDS.map(([k, l]) => <Chip key={k} label={`${l}${counts ? ` · ${counts[k]}` : ''}`} selected={k === kind} onPress={() => { setKind(k); setLimit(PAGE); }} />)}
      </View>
      {shown.length === 0 ? (
        <EmptyState icon="checkmark-done-outline" title="Nothing waiting here" body="Everything of this kind in this chapter has been checked, or none has been added yet." />
      ) : (<>
        <SectionHeader title={`${counts?.[kind] ?? shown.length} waiting`} />
        {shown.map((it) => (
          <Card key={it.id} style={{ marginBottom: space.sm, gap: space.xs }}>
            <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
              {it.topic ? <Tag label={it.topic} /> : null}{it.meta ? <Tag tone="warning" label={it.meta} /> : null}
            </View>
            <AppText variant="body" style={{ fontWeight: '600' }} selectable>{it.title}</AppText>
            <AppText variant="caption" selectable>{it.detail}</AppText>
            <Button title={it.kind === 'question' ? 'The answer key is correct' : it.kind === 'video' ? 'I watched it: it teaches this' : 'I checked this'} icon="checkmark" onPress={() => confirm(it)} />
          </Card>
        ))}
        {more && <Button title="Show more" icon="chevron-down" variant="secondary" onPress={() => setLimit(limit + PAGE)} />}
      </>)}
    </Page>
  );
}
