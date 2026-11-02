import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { AppText, Card, EmptyState, ErrorState, FadeIn, Icon, LoadingState, Page, SubjectDot, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { useAsync } from '../../src/hooks/useAsync';

export default function Learn() {
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const { data, error, reload } = useAsync(() => syllabusRepo.chapters(db), [db]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  if (data.length === 0) return <EmptyState title="No chapters yet" body="Your syllabus will appear here." icon="book-outline" />;

  const groups = (['math', 'physics', 'chemistry'] as const)
    .map((s) => ({ s, chapters: data.filter((c) => c.subject === s) })).filter((g) => g.chapters.length);

  return (
    <Page>
      <AppText variant="caption">2026–2027 · Class 9 · Sri Chaitanya IPL</AppText>
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
