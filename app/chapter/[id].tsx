import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { FormulaCard } from '../../src/components/content/FormulaCard';
import { AppText, Button, Card, EmptyState, ErrorState, FadeIn, Field, Icon, LoadingState, Page, SectionHeader, SubjectDot, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { contentRepo } from '../../src/database/repositories/content';
import { notesRepo } from '../../src/database/repositories/notes';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { VideoCard } from '../../src/components/content/VideoCard';
import { videoRepo } from '../../src/database/repositories/videos';
import { useContentSync } from '../../src/services/content/ContentSyncProvider';
import { useAsync } from '../../src/hooks/useAsync';

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started', learning: 'Learning', learning_completed: 'Lesson completed', practising: 'Practising', needs_revision: 'Needs revision', mastered: 'Mastered',
};

export default function ChapterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const content = useContentSync();
  const [topicName, setTopicName] = useState('');
  const [topicError, setTopicError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data, error, loading, reload } = useAsync(async () => {
    const chapter = await syllabusRepo.chapter(db, id);
    if (!chapter) return null;
    const [topics, formulas, notes, overview, videos] = await Promise.all([
      contentRepo.topics(db, id), contentRepo.formulas(db, id), notesRepo.list(db, id),
      db.first<{ n: number }>("SELECT COUNT(*) AS n FROM learning_content WHERE chapter_id = ? AND topic_id IS NULL AND deleted_at IS NULL AND verification_status != 'archived'", [id]),
      videoRepo.forChapter(db, id),
    ]);
    const counts = await db.all<{ topic_id: string; n: number }>("SELECT topic_id, COUNT(*) AS n FROM learning_content WHERE chapter_id = ? AND topic_id IS NOT NULL AND deleted_at IS NULL AND verification_status != 'archived' GROUP BY topic_id", [id]);
    return { chapter, topics, formulas, notes, videos, overviewCount: overview?.n ?? 0, lessonCounts: Object.fromEntries(counts.map((c) => [c.topic_id, c.n])) as Record<string, number> };
  }, [db, id, content.contentVersion]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return loading ? <LoadingState /> : <ErrorState message="Chapter not found." />;
  const { chapter, topics, formulas, notes, videos, overviewCount, lessonCounts } = data;
  const topicName0 = (tid: string | null) => topics.find((t) => t.id === tid)?.title;
  const videoActions = {
    onWatched: async (v: (typeof videos)[number]) => { await videoRepo.markWatched(db, v.id, !v.watchedAt); reload(); },
    onSaved: async (v: (typeof videos)[number]) => { await videoRepo.setSaved(db, v.id, !v.saved); reload(); },
    onVerified: async (v: (typeof videos)[number]) => { await videoRepo.setVerified(db, v.id, v.verification !== 'verified'); reload(); },
    onRemove: async (v: (typeof videos)[number]) => { await videoRepo.remove(db, v.id); reload(); },
  };
  const open = (topicId: string) => router.push({ pathname: '/lesson/[chapterId]', params: { chapterId: id, topicId } });

  const addTopic = async () => {
    try { await contentRepo.ensureTopic(db, id, topicName); setTopicName(''); setTopicError(null); reload(); }
    catch (e) { setTopicError(e instanceof Error ? e.message : 'Could not add'); }
  };
  const saveNote = async () => {
    try { await notesRepo.add(db, id, draft); setDraft(''); setSaveError(null); reload(); }
    catch (e) { setSaveError(e instanceof Error ? e.message : 'Could not save'); }
  };
  const deleteFormula = (fid: string) => {
    const go = async () => { await contentRepo.removeFormula(db, fid); reload(); };
    if (Platform.OS === 'web') return go();
    Alert.alert('Delete this formula?', 'It will be removed from this device and your other devices.', [{ text: 'Keep it', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: go }]);
  };

  return (
    <Page keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <SubjectDot subject={chapter.subject} size={12} />
        <AppText variant="label" color={colors[chapter.subject]}>{chapter.subjectName}</AppText>
      </View>
      <AppText variant="display" style={{ marginTop: space.xs }}>{chapter.title}</AppText>
      <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.sm, flexWrap: 'wrap' }}>
        <Tag label={`${chapter.lessonCount} lessons`} /><Tag label={`${chapter.formulaCount} formulas`} /><Tag label={`${chapter.questionCount} questions`} />
      </View>

      <SectionHeader title="Learn" icon="book-outline" />
      <Card tone={chapter.subject} onPress={() => open('overview')} accessibilityLabel={`Chapter overview, ${overviewCount} lessons`} style={{ marginBottom: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <AppText variant="heading">Chapter overview</AppText>
            <AppText variant="caption">{overviewCount === 0 ? 'No lessons yet' : `${overviewCount} lesson${overviewCount === 1 ? '' : 's'}`}</AppText>
          </View>
          <Icon name="chevron-forward" size="md" color={colors.textMuted} />
        </View>
      </Card>
      {topics.map((t, i) => (
        <FadeIn key={t.id} index={i}>
          <Card onPress={() => open(t.id)} accessibilityLabel={`${t.title}. ${STATUS_LABEL[t.status] ?? t.status}. ${lessonCounts[t.id] ?? 0} lessons`} style={{ marginBottom: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <View style={{ flex: 1, gap: space.xs }}>
                <AppText variant="heading">{t.title}</AppText>
                <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
                  <Tag tone={t.status === 'learning_completed' || t.status === 'mastered' ? 'success' : 'accent'} label={STATUS_LABEL[t.status] ?? t.status} />
                  <Tag label={`${lessonCounts[t.id] ?? 0} lessons`} />
                </View>
              </View>
              <Icon name="chevron-forward" size="md" color={colors.textMuted} />
            </View>
          </Card>
        </FadeIn>
      ))}
      <Card style={{ gap: space.sm }}>
        <Field label="Add a topic" placeholder="For example Escape velocity" value={topicName} onChangeText={setTopicName} error={topicError} returnKeyType="done" onSubmitEditing={addTopic} />
        <Button title="Add topic" icon="add" variant="secondary" onPress={addTopic} disabled={!topicName.trim()} />
      </Card>

      <SectionHeader title="Video lessons" icon="play-circle-outline" />
      {videos.length === 0 ? (
        <EmptyState icon="play-circle-outline" title="No video lessons yet" body="Add a link to a specific video or playlist that teaches this chapter. ORBIT never guesses videos for you."
          action={{ label: 'Add a lesson video', onPress: () => router.push({ pathname: '/content/video', params: { chapterId: id } }) }} />
      ) : (<>
        {videos.map((v) => <VideoCard key={v.id} v={v} topic={topicName0(v.topicId)} actions={videoActions} />)}
        <Button title="Add a lesson video" icon="add-circle-outline" variant="secondary" onPress={() => router.push({ pathname: '/content/video', params: { chapterId: id } })} />
      </>)}

      <SectionHeader title="Formula notebook" icon="calculator-outline" />
      {formulas.length === 0 ? (
        <EmptyState icon="calculator-outline" title="No formulas yet" body="Add the formulas for this chapter with what every symbol means." action={{ label: 'Add a formula', onPress: () => router.push({ pathname: '/content/formula', params: { chapterId: id } }) }} />
      ) : formulas.map((f) => <FormulaCard key={f.id} f={f} onDelete={() => deleteFormula(f.id)} />)}

      <SectionHeader title="My notes" icon="create-outline" />
      <Field label="New note" multiline minLines={3} placeholder="Write a note for this chapter" value={draft} onChangeText={setDraft} error={saveError} />
      <Button title="Save note" icon="save-outline" onPress={saveNote} disabled={!draft.trim()} style={{ marginTop: space.sm }} />
      {notes.map((n) => (
        <Card key={n.id} style={{ marginTop: space.sm }}>
          <AppText variant="body">{n.body}</AppText>
          <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.xs }}>
            {n.source === 'ai_tutor' ? <Tag tone="warning" label="From AI tutor · unverified" /> : null}
            <AppText variant="caption">{new Date(n.created_at).toLocaleDateString()}</AppText>
          </View>
        </Card>
      ))}

      <SectionHeader title="Add material" icon="add-circle-outline" />
      <View style={{ gap: space.sm }}>
        <Button title="Import lessons, formulas and questions" icon="cloud-upload-outline" onPress={() => router.push({ pathname: '/import', params: { chapterId: id } })} />
        <Button title="Add a lesson" icon="book-outline" variant="secondary" onPress={() => router.push({ pathname: '/content/lesson', params: { chapterId: id, topicId: 'overview' } })} />
        <Button title="Add a formula" icon="calculator-outline" variant="secondary" onPress={() => router.push({ pathname: '/content/formula', params: { chapterId: id } })} />
        <Button title="Add a question" icon="help-circle-outline" variant="secondary" onPress={() => router.push({ pathname: '/question/new', params: { chapterId: id } })} />
        <Button title="Practise this chapter" icon="create-outline" onPress={() => router.push({ pathname: '/quiz/setup', params: { mode: 'practice', chapterId: id } })} />
        <Button title="Ask the tutor about this chapter" icon="sparkles-outline" variant="ghost" onPress={() => router.push({ pathname: '/tutor', params: { chapterId: id } })} />
        <Button title="Add a mistake from this chapter" icon="bookmark-outline" variant="ghost" onPress={() => router.push({ pathname: '/mistake/new', params: { chapterId: id } })} />
      </View>
    </Page>
  );
}
