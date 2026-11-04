import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, EmptyState, ErrorState, FadeIn, Icon, LoadingState, Page, SubjectDot, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { loadStarterLibrary, starterTotals } from '../../src/content/starter';
import { useContentSync } from '../../src/services/content/ContentSyncProvider';
import { reviewRepo } from '../../src/database/repositories/review';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { useAsync } from '../../src/hooks/useAsync';

export default function Learn() {
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const content = useContentSync();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState<string | null>(null);
  const { data, error, reload } = useAsync(async () => {
    const chapters = await syllabusRepo.chapters(db);
    let waiting = 0;
    for (const c of chapters) { const n = await reviewRepo.counts(db, c.id); waiting += n.lesson + n.formula + n.question + n.video; }
    return { chapters, waiting };
  }, [db, content.contentVersion]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const { chapters: all, waiting } = data;
  if (all.length === 0) return <EmptyState title="No chapters yet" body="Your syllabus will appear here." icon="book-outline" />;

  const groups = (['math', 'physics', 'chemistry'] as const)
    .map((s) => ({ s, chapters: all.filter((c) => c.subject === s) })).filter((g) => g.chapters.length);

  return (
    <Page>
      <AppText variant="caption">2026–2027 · Class 9 · Sri Chaitanya IPL</AppText>
      <Card tone="accent" style={{ marginTop: space.sm, gap: space.sm }}>
        <AppText variant="heading" color={colors.onAccent}>ORBIT starter library</AppText>
        <AppText variant="caption" color={colors.onAccent}>{(() => { const t = starterTotals(); return `${t.lessons} lessons, ${t.formulas} formulas, ${t.questions} practice questions and ${t.videos} video links for the four current chapters. Original material, checked by computer where numbers are involved, but NOT yet checked by a teacher. It loads as "needs review".`; })()}</AppText>
        <Button title="Load the starter library" icon="download-outline" loading={loading} onPress={async () => {
          setLoading(true);
          try { const r = await loadStarterLibrary(db); const n = r.reduce((a, x) => a + x.added.lessons + x.added.formulas + x.added.questions + x.added.videos, 0); setLoaded(n ? `Added ${n} items. Now check them.` : 'Already loaded. Nothing new to add.'); reload(); }
          catch (e) { setLoaded(e instanceof Error ? e.message : 'Could not load'); } finally { setLoading(false); }
        }} />
        {loaded ? <AppText variant="caption" color={colors.onAccent} accessibilityRole="alert">{loaded}</AppText> : null}
        <Button title={waiting ? `Check material (${waiting} waiting)` : 'Check material'} icon="checkmark-done-outline" variant="secondary" onPress={() => router.push('/review')} />
      </Card>
      <Button title="IIT roadmap: the long view" icon="map-outline" variant="secondary" onPress={() => router.push('/roadmap')} style={{ marginTop: space.sm }} />
      {groups.map(({ s, chapters }, gi) => (
        <FadeIn key={s} index={gi} style={{ marginTop: space.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm }}>
            <SubjectDot subject={s} size={12} />
            <AppText variant="label" color={colors[s]}>{chapters[0].subjectName}</AppText>
          </View>
          {chapters.map((c) => {
            const empty = c.lessonCount + c.formulaCount + c.questionCount === 0;
            return (
              <Card key={c.id} tone={s} onPress={() => router.push({ pathname: '/chapter/[id]', params: { id: c.id } })}
                accessibilityLabel={`${c.title}, ${c.subjectName}. ${c.lessonCount} lessons, ${c.formulaCount} formulas, ${c.questionCount} questions`} style={{ marginBottom: space.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <View style={{ flex: 1, gap: space.sm }}>
                    <AppText variant="title">{c.title}</AppText>
                    <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
                      <Tag label={`${c.lessonCount} lessons`} />
                      <Tag label={`${c.formulaCount} formulas`} />
                      <Tag label={`${c.questionCount} questions`} />
                    </View>
                    {empty && <AppText variant="caption">No verified material yet. Add notes or questions from your books.</AppText>}
                  </View>
                  <Icon name="chevron-forward" size="md" color={colors.textMuted} />
                </View>
              </Card>
            );
          })}
        </FadeIn>
      ))}
    </Page>
  );
}
