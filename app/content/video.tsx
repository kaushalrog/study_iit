import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { AppText, Button, Card, Chip, ErrorState, Field, Group, LoadingState, Page, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { contentRepo } from '../../src/database/repositories/content';
import { newVideoSchema, PURPOSES, PURPOSE_LABEL, videoRepo } from '../../src/database/repositories/videos';
import { parseYoutube } from '../../src/features/content/youtube';
import { useAsync } from '../../src/hooks/useAsync';

/** Add a lesson link. The link must open one specific video or playlist, and "checked" is only ever the student's own statement. */
export default function VideoEditor() {
  const { chapterId, topicId } = useLocalSearchParams<{ chapterId: string; topicId?: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const { data, error, reload } = useAsync(() => contentRepo.topics(db, chapterId), [db, chapterId]);
  const [topic, setTopic] = useState<string | null>(topicId && topicId !== 'overview' ? topicId : null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]>('concept');
  const [level, setLevel] = useState<'foundation' | 'main' | 'advanced'>('main');
  const [language, setLanguage] = useState<'en' | 'te' | 'hi'>('en');
  const [minutes, setMinutes] = useState('');
  const [why, setWhy] = useState('');
  const [verified, setVerified] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const ref = url.trim() ? parseYoutube(url) : null;

  const save = async () => {
    const mins = Number(minutes);
    const input = { chapterId, topicId: topic, url, title, channel, purpose, level, language, why, verified, durationSeconds: minutes.trim() && Number.isFinite(mins) && mins > 0 ? Math.round(mins * 60) : null };
    const v = newVideoSchema.safeParse(input);
    if (!v.success) { setErr(v.error.issues[0].message); return; }
    setBusy(true); setErr(null);
    try { await videoRepo.add(db, input); router.back(); } catch (e) { setErr(e instanceof Error ? e.message : 'Could not save'); setBusy(false); }
  };

  return (
    <Page keyboardShouldPersistTaps="handled">
      <AppText variant="display">Add a lesson video</AppText>
      <AppText variant="caption" style={{ marginBottom: space.md }}>Paste the link to one video or playlist that teaches this topic. Search results and channel pages are not accepted.</AppText>
      <Group title="The link">
        <Field label="YouTube link" value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" error={url.trim() && !ref ? 'This is not a link to a specific video or playlist.' : null} />
        {ref ? <AppText variant="caption" color={colors.success}>Recognised a {ref.kind}: {ref.id}</AppText> : null}
        <Field label="Title" value={title} onChangeText={setTitle} />
        <Field label="Teacher or channel" value={channel} onChangeText={setChannel} />
        <Field label="Length in minutes (only if you know it)" keyboardType="number-pad" value={minutes} onChangeText={setMinutes} />
      </Group>
      <Group title="What it is for">
        <AppText variant="caption" style={{ fontWeight: '600' }}>Topic</AppText>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Chip label="Whole chapter" selected={topic === null} onPress={() => setTopic(null)} />
          {data.map((t) => <Chip key={t.id} label={t.title} selected={topic === t.id} onPress={() => setTopic(t.id)} />)}
        </View>
        <AppText variant="caption" style={{ fontWeight: '600' }}>Purpose</AppText>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>{PURPOSES.map((p) => <Chip key={p} label={PURPOSE_LABEL[p]} selected={purpose === p} onPress={() => setPurpose(p)} />)}</View>
        <AppText variant="caption" style={{ fontWeight: '600' }}>Level</AppText>
        <View style={{ flexDirection: 'row', gap: space.sm }}>{(['foundation', 'main', 'advanced'] as const).map((l) => <Chip key={l} label={l[0].toUpperCase() + l.slice(1)} selected={level === l} onPress={() => setLevel(l)} />)}</View>
        <AppText variant="caption" style={{ fontWeight: '600' }}>Language</AppText>
        <View style={{ flexDirection: 'row', gap: space.sm }}>{([['en', 'English'], ['te', 'Telugu'], ['hi', 'Hindi']] as const).map(([k, l]) => <Chip key={k} label={l} selected={language === k} onPress={() => setLanguage(k)} />)}</View>
        <Field label="Why watch this? (optional)" multiline minLines={2} value={why} onChangeText={setWhy} />
      </Group>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md }}>
        <View style={{ flex: 1 }}>
          <AppText variant="body" style={{ fontWeight: '600' }}>I opened this link and it teaches this topic</AppText>
          <AppText variant="caption">Leave it off if you have not watched it yet. The check date is saved.</AppText>
        </View>
        <Switch value={verified} onValueChange={setVerified} accessibilityLabel="Link checked" trackColor={{ true: colors.accentStrong, false: colors.controlBorder }} />
      </Card>
      {err ? <AppText variant="body" color={colors.danger} accessibilityRole="alert" style={{ marginBottom: space.sm }}>{err}</AppText> : null}
      <Button title="Save lesson video" icon="checkmark" onPress={save} loading={busy} />
    </Page>
  );
}
