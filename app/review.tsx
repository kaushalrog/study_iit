import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { AppText, Button, Card, Chip, EmptyState, ErrorState, LoadingState, Page, SectionHeader, Tag, space } from '../src/components/design-system';
import { useDb } from '../src/database/DatabaseProvider';
import { useRouter } from 'expo-router';
import { reviewRepo, ReviewItem, ReviewKind } from '../src/database/repositories/review';
import { reviewsRepo } from '../src/database/repositories/reviews';
import type { StatusResult } from '../src/features/review/rules';
import { syllabusRepo } from '../src/database/repositories/syllabus';
import { useAsync } from '../src/hooks/useAsync';

const KINDS: [ReviewKind, string][] = [['question', 'Questions'], ['lesson', 'Lessons'], ['formula', 'Formulas'], ['video', 'Videos']];
const PAGE = 15;

/** The checking desk. Material arrives "needs review"; only a person confirming it moves it into the verified library. */
export default function Review() {
  const params = useLocalSearchParams<{ chapterId?: string }>();
  const db = useDb();
  const router = useRouter();
  const [scope, setScope] = useState<'pending' | 'all'>('pending');
  const [chapter, setChapter] = useState<string | null>(params.chapterId ?? null);
  const [kind, setKind] = useState<ReviewKind>('question');
  const [limit, setLimit] = useState(PAGE);
  const { data, error, reload } = useAsync(async () => {
    const chapters = await syllabusRepo.chapters(db);
    const cid = chapter ?? chapters[0]?.id ?? null;
    if (!cid) return { chapters, cid, counts: null, items: [] as ReviewItem[], status: new Map<string, StatusResult>() };
    return { chapters, cid, counts: await reviewRepo.counts(db, cid), items: await reviewRepo.list(db, cid, kind, limit + 1, 0, scope), status: await reviewsRepo.statusMap(db, cid) };
  }, [db, chapter, kind, limit, scope]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const { chapters, cid, counts, items, status } = data;
  const label = (r: StatusResult | undefined) => {
    if (!r || r.status === 'unreviewed') return { tone: 'neutral' as const, text: 'Not academically reviewed' };
    const when = r.at ? ` ${r.at.slice(0, 10)}` : '';
    if (r.status === 'approved') return { tone: 'success' as const, text: `Approved by ${r.by},${when}` };
    if (r.status === 'stale') return { tone: 'warning' as const, text: `Edited since ${r.by} approved it` };
    if (r.status === 'rejected') return { tone: 'danger' as const, text: `Rejected by ${r.by}` };
    return { tone: 'warning' as const, text: `${r.by} wants more research` };
  };
  const more = items.length > limit;
  const shown = items.slice(0, limit);

  const confirm = (it: ReviewItem) => {
    const go = async () => { await reviewRepo.confirm(db, it.kind, it.id); reload(); };
    if (Platform.OS === 'web' || it.kind !== 'video') return go();
    Alert.alert('Have you opened and watched this video?', 'Confirm only if it teaches this topic correctly.', [{ text: 'Not yet', style: 'cancel' }, { text: 'Yes, confirm', onPress: go }]);
  };

  return (
    <Page>
      <AppText variant="caption" style={{ marginBottom: space.sm }}>A student check lets a question join practice and mastery. It is not academic approval: that comes only from an authorised reviewer's decision (see Reviewer tools). Nothing is confirmed automatically.</AppText>
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap', marginBottom: space.sm }}>
        <Chip label="Waiting for my check" selected={scope === 'pending'} onPress={() => { setScope('pending'); setLimit(PAGE); }} />
        <Chip label="All items" selected={scope === 'all'} onPress={() => { setScope('all'); setLimit(PAGE); }} />
        <Chip label="Reviewer tools" onPress={() => router.push('/review-desk')} />
      </View>
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
            {(() => { const st = status.get(`${it.kind}:${it.id}`); const l = label(st); return (<View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}><Tag tone={l.tone} label={l.text} />{st?.feedback ? <Tag label={`Reviewer: ${st.feedback.slice(0, 60)}`} /> : null}</View>); })()}
            <AppText variant="body" style={{ fontWeight: '600' }} selectable>{it.title}</AppText>
            <AppText variant="caption" selectable>{it.detail}</AppText>
            <Button title={it.kind === 'question' ? 'Student check: the key is correct' : it.kind === 'video' ? 'Student check: I watched it' : 'Student check: I read this'} icon="checkmark" onPress={() => confirm(it)} />
          </Card>
        ))}
        {more && <Button title="Show more" icon="chevron-down" variant="secondary" onPress={() => setLimit(limit + PAGE)} />}
      </>)}
    </Page>
  );
}
