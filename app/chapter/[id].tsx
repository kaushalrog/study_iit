import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, Chip, EmptyState, ErrorState, Field, FadeIn, Icon, LoadingState, Page, SectionHeader, SubjectDot, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { notesRepo } from '../../src/database/repositories/notes';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { useAsync } from '../../src/hooks/useAsync';

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started', learning: 'Learning', learning_completed: 'Learning completed',
  practising: 'Practising', needs_revision: 'Needs revision', mastered: 'Mastered',
};
const isVerified = (s: string) => s === 'verified' || s === 'published';

export default function ChapterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const [draft, setDraft] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data, error, loading, reload } = useAsync(async () => {
    const chapter = await syllabusRepo.chapter(db, id);
    if (!chapter) return null;
    const [topics, lessons, formulas, notes] = await Promise.all([
      syllabusRepo.topics(db, id), syllabusRepo.lessons(db, id, lang), syllabusRepo.formulas(db, id), notesRepo.list(db, id),
    ]);
    return { chapter, topics, lessons, formulas, notes };
  }, [db, id, lang]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return loading ? <LoadingState /> : <ErrorState message="Chapter not found." />;
  const { chapter, topics, lessons, formulas, notes } = data;

  const saveNote = async () => {
    try { await notesRepo.add(db, id, draft); setDraft(''); setSaveError(null); reload(); }
    catch (e) { setSaveError(e instanceof Error ? e.message : 'Could not save'); }
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

      <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
        <Chip label="English" selected={lang === 'en'} onPress={() => setLang('en')} />
        <Chip label="తెలుగు" selected={lang === 'te'} onPress={() => setLang('te')} />
      </View>

      <SectionHeader title="Lessons" icon="book-outline" />
      {lessons.length === 0 ? (
        <EmptyState icon="book-outline" title={lang === 'te' ? 'No Telugu lesson yet' : 'No lessons yet'}
          body="Lessons appear here once they are added from your coaching notes and marked verified. Nothing is made up in the meantime." />
      ) : lessons.map((l, i) => (
        <FadeIn key={l.id} index={i}>
          <Card tone={chapter.subject} style={{ marginBottom: space.sm }}>
            <AppText variant="label">{l.section.replace(/_/g, ' ')} · {l.level}</AppText>
            <AppText variant="body" style={{ marginTop: space.xs }}>{l.body}</AppText>
          </Card>
        </FadeIn>
      ))}

      <SectionHeader title="Topics" icon="git-branch-outline" />
      {topics.length === 0 ? (
        <AppText variant="caption">Subtopics are added from your textbook; none have been entered yet.</AppText>
      ) : topics.map((t) => (
        <Card key={t.id} style={{ marginBottom: space.sm }}>
          <AppText variant="body" style={{ fontWeight: '600' }}>{t.title}</AppText>
          <View style={{ flexDirection: 'row', marginTop: space.xs }}><Tag tone={t.status === 'mastered' ? 'success' : 'accent'} label={STATUS_LABEL[t.status]} /></View>
        </Card>
      ))}

      <SectionHeader title="Formula notebook" icon="calculator-outline" />
      {formulas.length === 0 ? (
        <AppText variant="caption">No formulas recorded yet.</AppText>
      ) : formulas.map((f) => (
        <Card key={f.id} style={{ marginBottom: space.sm, gap: space.xs }}>
          <AppText variant="heading">{f.name}</AppText>
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: space.sm }}>
            <AppText variant="body" style={{ fontFamily: 'monospace' }} selectable>{f.latex}</AppText>
          </View>
          <Tag tone={isVerified(f.verification_status) ? 'success' : 'warning'} label={isVerified(f.verification_status) ? 'Verified' : 'Not yet verified'} />
        </Card>
      ))}

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

      <View style={{ marginTop: space.lg, gap: space.sm }}>
        <Button title="Ask the tutor about this chapter" icon="sparkles-outline" variant="secondary" onPress={() => router.push({ pathname: '/tutor', params: { chapterId: id } })} />
        <Button title="Add a question" icon="help-circle-outline" variant="ghost" onPress={() => router.push({ pathname: '/question/new', params: { chapterId: id } })} />
        <Button title="Add a mistake from this chapter" icon="bookmark-outline" variant="ghost" onPress={() => router.push({ pathname: '/mistake/new', params: { chapterId: id } })} />
      </View>
    </Page>
  );
}
