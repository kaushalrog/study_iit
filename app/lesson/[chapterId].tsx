import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { FormulaCard } from '../../src/components/content/FormulaCard';
import { VideoCard } from '../../src/components/content/VideoCard';
import { AppText, Button, Card, Chip, EmptyState, ErrorState, Field, Icon, LoadingState, Page, SubjectDot, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { contentRepo } from '../../src/database/repositories/content';
import { notesRepo } from '../../src/database/repositories/notes';
import { pyqRepo } from '../../src/database/repositories/pyq';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { videoRepo } from '../../src/database/repositories/videos';
import { SECTION_LABEL } from '../../src/features/syllabus/importBundle';
import { richToReadable } from '../../src/features/syllabus/math';
import { nextTab, ReaderTab, READER_TABS, tabItemCount, TAB_LABEL, TAB_SECTIONS } from '../../src/features/syllabus/readerTabs';
import { useAsync } from '../../src/hooks/useAsync';

type Level = 'all' | 'foundation' | 'main' | 'advanced';
const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started', learning: 'Learning', learning_completed: 'Lesson completed', practising: 'Practising', needs_revision: 'Needs revision', mastered: 'Mastered',
};

/** One topic, taught in a guided order: overview, understand, examples, videos, practice, PYQs, notes, revise. */
export default function Lesson() {
  const { chapterId, topicId } = useLocalSearchParams<{ chapterId: string; topicId?: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const [level, setLevel] = useState<Level>('all');
  const [tab, setTab] = useState<ReaderTab>('overview');
  const [draft, setDraft] = useState('');
  const [noteErr, setNoteErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const tid = topicId && topicId !== 'overview' ? topicId : null;

  const { data, error, loading, reload } = useAsync(async () => {
    const chapter = await syllabusRepo.chapter(db, chapterId);
    if (!chapter) return null;
    const [topics, lessons, formulas, videos, pyqs, practice, notes] = await Promise.all([
      contentRepo.topics(db, chapterId), contentRepo.lessons(db, chapterId, lang), contentRepo.formulas(db, chapterId),
      videoRepo.forChapter(db, chapterId), pyqRepo.list(db, chapterId, tid), pyqRepo.practiceCounts(db, chapterId, tid), notesRepo.forTopic(db, chapterId, tid),
    ]);
    return {
      chapter, topic: topics.find((t) => t.id === tid) ?? null,
      lessons: lessons.filter((l) => l.topicId === tid), formulas: formulas.filter((f) => f.topicId === tid),
      videos: videos.filter((v) => v.topicId === tid), pyqs, practice, notes,
    };
  }, [db, chapterId, tid, lang]);

  // Opening a lesson means she has started learning it. This never claims mastery.
  useEffect(() => {
    if (data?.topic?.status === 'not_started') syllabusRepo.setTopicStatus(db, data.topic.id, 'learning').then(reload).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.topic?.id]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return loading ? <LoadingState /> : <ErrorState message="Chapter not found." />;
  const { chapter, topic, lessons, formulas, videos, pyqs, practice, notes } = data;
  const shown = lessons.filter((l) => level === 'all' || l.level === level);
  const sectionCounts: Record<string, number> = {};
  for (const l of lessons) sectionCounts[l.section] = (sectionCounts[l.section] ?? 0) + 1;
  const counts = { lessons: sectionCounts, formulas: formulas.length, videos: videos.length, questions: practice.chapter, pyqs: pyqs.length, notes: notes.length };
  const add = (pathname: '/content/lesson' | '/content/formula' | '/content/video') => router.push({ pathname, params: { chapterId, topicId: tid ?? 'overview' } });

  const complete = async () => { if (topic) { await syllabusRepo.setTopicStatus(db, topic.id, 'learning_completed'); setDone(true); reload(); } };
  const confirmDelete = (id: string) => {
    const go = async () => { await contentRepo.removeLesson(db, id); reload(); };
    if (Platform.OS === 'web') return go();
    Alert.alert('Delete this lesson?', 'It will be removed from this device and your other devices.', [{ text: 'Keep it', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: go }]);
  };
  const saveNote = async () => {
    try { await notesRepo.add(db, chapterId, draft, { topicId: tid }); setDraft(''); setNoteErr(null); reload(); } catch (e) { setNoteErr(e instanceof Error ? e.message : 'Could not save'); }
  };
  const videoActions = {
    onWatched: async (v: (typeof videos)[number]) => { await videoRepo.markWatched(db, v.id, !v.watchedAt); reload(); },
    onSaved: async (v: (typeof videos)[number]) => { await videoRepo.setSaved(db, v.id, !v.saved); reload(); },
    onVerified: async (v: (typeof videos)[number]) => { await videoRepo.setVerified(db, v.id, v.verification !== 'verified'); reload(); },
    onRemove: async (v: (typeof videos)[number]) => { await videoRepo.remove(db, v.id); reload(); },
  };

  const lessonCards = (tabKey: ReaderTab) => {
    const sections = TAB_SECTIONS[tabKey] ?? [];
    const items = shown.filter((l) => (sections as string[]).includes(l.section));
    if (items.length === 0) return null;
    return items.map((l) => {
      const ok = l.verification === 'verified' || l.verification === 'published';
      return (
        <Card key={l.id} style={{ marginBottom: space.sm, gap: space.xs }}>
          <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
            <Tag tone="neutral" label={SECTION_LABEL[l.section]} />
            <Tag tone="accent" label={l.level.charAt(0).toUpperCase() + l.level.slice(1)} />
            <Tag tone={ok ? 'success' : 'warning'} label={ok ? 'Verified' : 'Not yet verified'} />
          </View>
          <AppText variant="body" selectable style={{ fontSize: 17, lineHeight: 27 }}>{richToReadable(l.body)}</AppText>
          {l.sourceNote ? <AppText variant="caption">Source: {l.sourceNote}</AppText> : null}
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Button variant="ghost" icon="create-outline" title="Edit" onPress={() => router.push({ pathname: '/content/lesson', params: { chapterId, lessonId: l.id } })} />
            <Button variant="ghost" icon="trash-outline" title="Delete" onPress={() => confirmDelete(l.id)} />
          </View>
        </Card>
      );
    });
  };
  const emptyLesson = (what: string) => (
    <EmptyState icon="book-outline" title={lang === 'te' ? `No Telugu ${what} yet` : `No ${what} here yet`}
      body="Add it from your notes or book, or import a whole chapter. ORBIT never writes lesson text for you without labelling it."
      action={{ label: 'Add a lesson', onPress: () => add('/content/lesson') }} />
  );

  const body = () => {
    switch (tab) {
      case 'overview': return lessonCards('overview') ?? emptyLesson('overview');
      case 'understand': {
        const l = lessonCards('understand');
        return (<>
          {l ?? emptyLesson('explanation')}
          {formulas.length > 0 && <AppText variant="heading" style={{ marginVertical: space.sm }}>Formulas</AppText>}
          {formulas.map((f) => <FormulaCard key={f.id} f={f} />)}
          <Button variant="secondary" icon="calculator-outline" title="Add a formula" onPress={() => add('/content/formula')} style={{ marginTop: space.sm }} />
        </>);
      }
      case 'examples': return lessonCards('examples') ?? emptyLesson('worked examples');
      case 'videos': return videos.length === 0 ? (
        <EmptyState icon="play-circle-outline" title="No video lessons for this topic yet" body="Add a link to a specific video or playlist. ORBIT never guesses videos for you." action={{ label: 'Add a lesson video', onPress: () => add('/content/video') }} />
      ) : (<>
        {videos.map((v) => <VideoCard key={v.id} v={v} actions={videoActions} />)}
        <Button variant="secondary" icon="add-circle-outline" title="Add a lesson video" onPress={() => add('/content/video')} />
      </>);
      case 'practice': return practice.chapter === 0 ? (
        <EmptyState icon="create-outline" title="No verified practice questions yet" body="Add questions and confirm their answer keys. Only confirmed questions are used for practice and mastery."
          action={{ label: 'Add a question', onPress: () => router.push({ pathname: '/question/new', params: { chapterId } }) }} />
      ) : (
        <Card style={{ gap: space.sm }}>
          <AppText variant="body">{practice.chapter} verified question{practice.chapter === 1 ? '' : 's'} in this chapter{tid ? ` (${practice.topic} tagged to this topic)` : ''}.</AppText>
          <AppText variant="caption">Hints and instant feedback in practice mode. Mastery comes from answering on your own.</AppText>
          <Button title="Practise this chapter" icon="create-outline" onPress={() => router.push({ pathname: '/quiz/setup', params: { mode: 'practice', chapterId } })} />
          <Button title="Add a question" icon="add-circle-outline" variant="secondary" onPress={() => router.push({ pathname: '/question/new', params: { chapterId } })} />
        </Card>
      );
      case 'pyqs': return pyqs.length === 0 ? (
        <EmptyState icon="ribbon-outline" title="No previous-year questions yet" body="A question counts as a PYQ only with its exam, year and where you found it. Add official questions with that trace, and they appear here."
          action={{ label: 'Add an official question', onPress: () => router.push({ pathname: '/question/new', params: { chapterId } }) }} />
      ) : pyqs.map((q) => (
        <Card key={q.id} style={{ marginBottom: space.sm, gap: space.xs }}>
          <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}><Tag tone="accent" label={`${q.examLabel} ${q.year}`} />{q.session ? <Tag label={q.session} /> : null}<Tag tone="success" label="Source recorded" /></View>
          <AppText variant="body">{richToReadable(q.stem)}</AppText>
          <AppText variant="caption">Source: {q.citation}</AppText>
        </Card>
      ));
      case 'notes': return (<>
        <Field label="New note" multiline minLines={3} placeholder={`A note for ${topic ? topic.title : 'this chapter'}`} value={draft} onChangeText={setDraft} error={noteErr} />
        <Button title="Save note" icon="save-outline" onPress={saveNote} disabled={!draft.trim()} style={{ marginVertical: space.sm }} />
        {notes.length === 0 ? <AppText variant="caption">No notes for this topic yet.</AppText> : notes.map((n) => (
          <Card key={n.id} style={{ marginBottom: space.sm }}>
            <AppText variant="body" selectable>{n.body}</AppText>
            <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.xs }}>
              {n.source === 'ai_tutor' ? <Tag tone="warning" label="From AI tutor · unverified" /> : null}
              <AppText variant="caption">{new Date(n.created_at).toLocaleDateString()}</AppText>
            </View>
          </Card>
        ))}
      </>);
      case 'revise': return (<>
        {lessonCards('revise')}
        {formulas.length > 0 && <AppText variant="heading" style={{ marginVertical: space.sm }}>Formula sheet</AppText>}
        {formulas.map((f) => <FormulaCard key={f.id} f={f} />)}
        {!lessonCards('revise') && formulas.length === 0 && emptyLesson('summary')}
        {topic && (
          <Card tone="accent" style={{ marginTop: space.md, gap: space.sm }}>
            {done || topic.status === 'learning_completed' ? (<>
              <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}><Icon name="checkmark-circle" size="md" color={colors.onAccent} /><AppText variant="heading" color={colors.onAccent}>Lesson completed</AppText></View>
              <AppText variant="body" color={colors.onAccent}>Reading is only the first step. Mastery comes from answering questions on your own, so practise next.</AppText>
              <Button title="Practise this chapter" icon="create-outline" onPress={() => router.push({ pathname: '/quiz/setup', params: { mode: 'practice', chapterId } })} />
            </>) : (<>
              <AppText variant="body" color={colors.onAccent}>Finished reading and understanding this topic?</AppText>
              <Button title="I've finished this lesson" icon="checkmark-done" onPress={complete} />
            </>)}
          </Card>
        )}
      </>);
    }
  };
  const nt = nextTab(tab);

  return (
    <Page>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <SubjectDot subject={chapter.subject} size={12} />
        <AppText variant="label" color={colors[chapter.subject]}>{chapter.title}</AppText>
      </View>
      <AppText variant="display" style={{ marginTop: space.xs }}>{topic ? topic.title : 'Chapter overview'}</AppText>
      {topic && <View style={{ flexDirection: 'row', marginTop: space.sm }}><Tag tone={topic.status === 'learning_completed' || topic.status === 'mastered' ? 'success' : 'accent'} label={STATUS_LABEL[topic.status] ?? topic.status} /></View>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.md, flexGrow: 0 }} contentContainerStyle={{ gap: space.sm, paddingVertical: space.xs }} accessibilityRole="tablist">
        {READER_TABS.map((t) => {
          const n = tabItemCount(t, counts);
          return <Chip key={t} label={`${TAB_LABEL[t]}${n ? ` · ${n}` : ''}`} selected={tab === t} onPress={() => setTab(t)} />;
        })}
      </ScrollView>

      {(tab === 'overview' || tab === 'understand' || tab === 'examples' || tab === 'revise') && (
        <View style={{ flexDirection: 'row', gap: space.sm, marginVertical: space.sm, flexWrap: 'wrap' }}>
          <Chip label="English" selected={lang === 'en'} onPress={() => setLang('en')} />
          <Chip label="తెలుగు" selected={lang === 'te'} onPress={() => setLang('te')} />
          {(['all', 'foundation', 'main', 'advanced'] as const).map((l) => <Chip key={l} label={l === 'all' ? 'All levels' : l.charAt(0).toUpperCase() + l.slice(1)} selected={level === l} onPress={() => setLevel(l)} />)}
        </View>
      )}

      <View style={{ marginTop: space.sm }}>{body()}</View>

      <View style={{ gap: space.sm, marginTop: space.lg }}>
        {(tab === 'overview' || tab === 'understand' || tab === 'examples' || tab === 'revise') && <Button variant="secondary" icon="add-circle-outline" title="Add a lesson" onPress={() => add('/content/lesson')} />}
        {nt && <Button title={`Next: ${TAB_LABEL[nt]}`} icon="arrow-forward" onPress={() => setTab(nt)} />}
        <Button variant="ghost" icon="sparkles-outline" title="Ask the tutor about this" onPress={() => router.push({ pathname: '/tutor', params: { chapterId } })} />
      </View>
    </Page>
  );
}
