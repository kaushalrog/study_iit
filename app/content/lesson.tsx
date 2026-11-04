import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useUpdateGuard } from '../../src/services/updates/UpdateProvider';
import { Switch, View } from 'react-native';
import { AppText, Button, Card, Chip, ErrorState, Field, Group, LoadingState, Page, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { contentRepo, newLessonSchema } from '../../src/database/repositories/content';
import { LESSON_SECTIONS, LessonSection, SECTION_LABEL } from '../../src/features/syllabus/importBundle';
import { richToReadable } from '../../src/features/syllabus/math';
import { useAsync } from '../../src/hooks/useAsync';

export default function LessonEditor() {
  const { chapterId, topicId, lessonId } = useLocalSearchParams<{ chapterId: string; topicId?: string; lessonId?: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const editing = !!lessonId;

  const { data, error, reload } = useAsync(async () => ({ topics: await contentRepo.topics(db, chapterId), existing: lessonId ? await contentRepo.lesson(db, lessonId) : null }), [db, chapterId, lessonId]);
  const [topic, setTopic] = useState<string | null>(topicId && topicId !== 'overview' ? topicId : null);
  const [section, setSection] = useState<LessonSection>('explanation');
  const [level, setLevel] = useState<'foundation' | 'main' | 'advanced'>('main');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [body, setBody] = useState('');
  useUpdateGuard('an unsaved lesson', !!body.trim());
  const [source, setSource] = useState('');
  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const e = data?.existing;
    if (e && !loaded) { setTopic(e.topicId); setSection(e.section); setLevel(e.level as typeof level); setLanguage(e.language); setBody(e.body); setSource(e.sourceNote ?? ''); setVerified(e.verification === 'verified'); setLoaded(true); }
  }, [data, loaded]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;

  const save = async () => {
    const input = { chapterId, topicId: topic, section, level, language, body, sourceNote: source, verified };
    const v = newLessonSchema.safeParse(input);
    if (!v.success) { setMsg(v.error.issues[0].message); return; }
    try {
      if (editing) await contentRepo.updateLesson(db, lessonId!, { body, verified });
      else await contentRepo.addLesson(db, input);
      router.back();
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not save'); }
  };

  return (
    <Page keyboardShouldPersistTaps="handled">
      {!editing && (
        <Group title="Where it goes">
          <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Topic</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            <Chip label="Whole chapter" selected={topic === null} onPress={() => setTopic(null)} />
            {data.topics.map((t) => <Chip key={t.id} label={t.title} selected={topic === t.id} onPress={() => setTopic(t.id)} />)}
          </View>
          <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Part of the lesson</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {LESSON_SECTIONS.map((s) => <Chip key={s} label={SECTION_LABEL[s]} selected={section === s} onPress={() => setSection(s)} />)}
          </View>
          <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Level and language</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {(['foundation', 'main', 'advanced'] as const).map((l) => <Chip key={l} label={l.charAt(0).toUpperCase() + l.slice(1)} selected={level === l} onPress={() => setLevel(l)} />)}
            <Chip label="English" selected={language === 'en'} onPress={() => setLanguage('en')} />
            <Chip label="తెలుగు" selected={language === 'te'} onPress={() => setLanguage('te')} />
          </View>
        </Group>
      )}
      <Group title="Lesson text">
        <Field label="Text" multiline minLines={8} value={body} onChangeText={setBody}
          hint="Write maths between dollar signs, for example $F = G\frac{m_1 m_2}{r^2}$ or $v^2 = u^2 + 2as$." placeholder="Explain it in your own words, or copy from your notes" />
        {body.trim() ? (
          <View style={{ gap: space.xs }}>
            <AppText variant="label">How it will look</AppText>
            <Card tone="accent"><AppText variant="body" color={colors.onAccent} style={{ fontSize: 17, lineHeight: 27 }}>{richToReadable(body)}</AppText></Card>
          </View>
        ) : null}
        {!editing && <Field label="Source (optional)" placeholder="Book name and page, or class notes date" value={source} onChangeText={setSource} />}
      </Group>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md }}>
        <View style={{ flex: 1 }}>
          <AppText variant="body" style={{ fontWeight: '600' }}>I checked this against my book or teacher</AppText>
          <AppText variant="caption">Unchecked lessons still show, with a "Not yet verified" label.</AppText>
        </View>
        <Switch value={verified} onValueChange={setVerified} accessibilityLabel="Lesson checked" trackColor={{ true: colors.accentStrong, false: colors.controlBorder }} />
      </Card>
      {msg ? <AppText variant="body" color={colors.danger} accessibilityRole="alert" style={{ marginBottom: space.sm }}>{msg}</AppText> : null}
      <Button title={editing ? 'Save changes' : 'Save lesson'} icon="save-outline" onPress={save} />
    </Page>
  );
}
