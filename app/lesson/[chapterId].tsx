import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { Collapsible } from '../../src/components/content/Collapsible';
import { FormulaCard } from '../../src/components/content/FormulaCard';
import { AppText, Button, Card, Chip, EmptyState, ErrorState, Icon, LoadingState, Page, SectionHeader, SubjectDot, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { contentRepo } from '../../src/database/repositories/content';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { LESSON_SECTIONS, SECTION_LABEL } from '../../src/features/syllabus/importBundle';
import { richToReadable } from '../../src/features/syllabus/math';
import { useAsync } from '../../src/hooks/useAsync';

type Level = 'all' | 'foundation' | 'main' | 'advanced';
const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started', learning: 'Learning', learning_completed: 'Lesson completed', practising: 'Practising', needs_revision: 'Needs revision', mastered: 'Mastered',
};

export default function Lesson() {
  const { chapterId, topicId } = useLocalSearchParams<{ chapterId: string; topicId?: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const [level, setLevel] = useState<Level>('all');
  const [done, setDone] = useState(false);
  const tid = topicId && topicId !== 'overview' ? topicId : null;

  const { data, error, loading, reload } = useAsync(async () => {
    const chapter = await syllabusRepo.chapter(db, chapterId);
    if (!chapter) return null;
    const [topics, lessons, formulas] = await Promise.all([contentRepo.topics(db, chapterId), contentRepo.lessons(db, chapterId, lang), contentRepo.formulas(db, chapterId)]);
    return { chapter, topic: topics.find((t) => t.id === tid) ?? null, lessons: lessons.filter((l) => l.topicId === tid), formulas: formulas.filter((f) => f.topicId === tid) };
  }, [db, chapterId, tid, lang]);

  // Opening a lesson means she has started learning it. This never claims mastery.
  useEffect(() => {
    if (data?.topic?.status === 'not_started') syllabusRepo.setTopicStatus(db, data.topic.id, 'learning').then(reload).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.topic?.id]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return loading ? <LoadingState /> : <ErrorState message="Chapter not found." />;
  const { chapter, topic, lessons, formulas } = data;
  const shown = lessons.filter((l) => level === 'all' || l.level === level);
  const bySection = LESSON_SECTIONS.map((s) => ({ s, items: shown.filter((l) => l.section === s) })).filter((g) => g.items.length);
  const add = (pathname: '/content/lesson' | '/content/formula') => router.push({ pathname, params: { chapterId, topicId: tid ?? 'overview' } });

  const complete = async () => { if (topic) { await syllabusRepo.setTopicStatus(db, topic.id, 'learning_completed'); setDone(true); reload(); } };
  const confirmDelete = (id: string) => {
    const go = async () => { await contentRepo.removeLesson(db, id); reload(); };
    if (Platform.OS === 'web') return go();
    Alert.alert('Delete this lesson?', 'It will be removed from this device and your other devices.', [{ text: 'Keep it', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: go }]);
  };

  return (
    <Page>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <SubjectDot subject={chapter.subject} size={12} />
        <AppText variant="label" color={colors[chapter.subject]}>{chapter.title}</AppText>
      </View>
      <AppText variant="display" style={{ marginTop: space.xs }}>{topic ? topic.title : 'Chapter overview'}</AppText>
      {topic && <View style={{ flexDirection: 'row', marginTop: space.sm }}><Tag tone={topic.status === 'learning_completed' || topic.status === 'mastered' ? 'success' : 'accent'} label={STATUS_LABEL[topic.status] ?? topic.status} /></View>}

      <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md, flexWrap: 'wrap' }}>
        <Chip label="English" selected={lang === 'en'} onPress={() => setLang('en')} />
        <Chip label="తెలుగు" selected={lang === 'te'} onPress={() => setLang('te')} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' }}>
        {(['all', 'foundation', 'main', 'advanced'] as const).map((l) => <Chip key={l} label={l === 'all' ? 'All levels' : l.charAt(0).toUpperCase() + l.slice(1)} selected={level === l} onPress={() => setLevel(l)} />)}
      </View>

      <SectionHeader title="Lesson" icon="book-outline" />
      {bySection.length === 0 ? (
        <EmptyState icon="book-outline" title={lang === 'te' ? 'No Telugu lesson yet' : 'No lesson here yet'}
          body="Add a lesson from your notes or book, or import a whole chapter at once. ORBIT never writes lesson text for you without labelling it."
          action={{ label: 'Add a lesson', onPress: () => add('/content/lesson') }} />
      ) : bySection.map(({ s, items }, gi) => (
        <Collapsible key={s} title={SECTION_LABEL[s]} tone={chapter.subject} defaultOpen={gi === 0}>
          {items.map((l) => {
            const ok = l.verification === 'verified' || l.verification === 'published';
            return (
              <View key={l.id} style={{ gap: space.xs }}>
                <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
                  <Tag tone="accent" label={l.level.charAt(0).toUpperCase() + l.level.slice(1)} />
                  <Tag tone={ok ? 'success' : 'warning'} label={ok ? 'Verified' : 'Not yet verified'} />
                </View>
                <AppText variant="body" selectable style={{ fontSize: 17, lineHeight: 27 }}>{richToReadable(l.body)}</AppText>
                {l.sourceNote ? <AppText variant="caption">Source: {l.sourceNote}</AppText> : null}
                <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
                  <Button variant="ghost" icon="create-outline" title="Edit" onPress={() => router.push({ pathname: '/content/lesson', params: { chapterId, lessonId: l.id } })} />
                  <Button variant="ghost" icon="trash-outline" title="Delete" onPress={() => confirmDelete(l.id)} />
                </View>
              </View>
            );
          })}
        </Collapsible>
      ))}

      <SectionHeader title="Formulas" icon="calculator-outline" />
      {formulas.length === 0 ? <AppText variant="caption">No formulas for this {topic ? 'topic' : 'overview'} yet.</AppText> : formulas.map((f) => <FormulaCard key={f.id} f={f} />)}

      <View style={{ gap: space.sm, marginTop: space.md }}>
        <Button variant="secondary" icon="add-circle-outline" title="Add a lesson" onPress={() => add('/content/lesson')} />
        <Button variant="secondary" icon="calculator-outline" title="Add a formula" onPress={() => add('/content/formula')} />
      </View>

      {topic && (
        <Card tone="accent" style={{ marginTop: space.lg, gap: space.sm }}>
          {done || topic.status === 'learning_completed' ? (
            <>
              <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}><Icon name="checkmark-circle" size="md" color={colors.onAccent} /><AppText variant="heading" color={colors.onAccent}>Lesson completed</AppText></View>
              <AppText variant="body" color={colors.onAccent}>Reading is only the first step. Mastery comes from answering questions on your own, so practise next.</AppText>
              <Button title="Practise this chapter" icon="create-outline" onPress={() => router.push({ pathname: '/quiz/setup', params: { mode: 'practice', chapterId } })} />
            </>
          ) : (
            <>
              <AppText variant="body" color={colors.onAccent}>Finished reading and understanding this topic?</AppText>
              <Button title="I've finished this lesson" icon="checkmark-done" onPress={complete} />
            </>
          )}
        </Card>
      )}
      <View style={{ marginTop: space.md }}>
        <Button variant="ghost" icon="sparkles-outline" title="Ask the tutor about this" onPress={() => router.push({ pathname: '/tutor', params: { chapterId } })} />
      </View>
    </Page>
  );
}
