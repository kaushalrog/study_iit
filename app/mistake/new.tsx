import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { AppText, Button, Card, Chip, ErrorState, Field, Group, LoadingState, Page, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { CATEGORY_LABEL, MISTAKE_CATEGORIES, MistakeCategory, mistakeRepo, newMistakeSchema } from '../../src/database/repositories/mistakes';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { useAsync } from '../../src/hooks/useAsync';
import { askTutor, TutorError } from '../../src/services/ai/tutorClient';
import { toDateKey } from '../../src/utils/dates';

export default function NewMistake() {
  const params = useLocalSearchParams<{ chapterId?: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const { data: chapters, error, reload } = useAsync(() => syllabusRepo.chapters(db), [db]);

  const [chapterId, setChapterId] = useState<string | null>(params.chapterId ?? null);
  const [text, setText] = useState('');
  const [correct, setCorrect] = useState('');
  const [explanation, setExplanation] = useState('');
  const [steps, setSteps] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<MistakeCategory | null>(null);
  const [image, setImage] = useState<{ uri: string; base64?: string | null } | null>(null);
  const [ocrPending, setOcrPending] = useState(false);
  const [ocrMsg, setOcrMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'chapter' | 'text' | 'category' | 'general', string>>>({});

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!chapters) return <LoadingState />;
  const chapter = chapters.find((c) => c.id === chapterId) ?? null;

  const pick = async (camera: boolean) => {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setErrors({ general: camera ? 'Camera permission is needed to scan a question.' : 'Photo access is needed to import an image.' }); return; }
    const res = await (camera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync)({ allowsEditing: true, quality: 0.7, base64: true });
    if (!res.canceled) { setImage({ uri: res.assets[0].uri, base64: res.assets[0].base64 }); setErrors({}); }
  };

  const extract = async () => {
    if (!image?.base64) return;
    setOcrMsg('Reading the question…');
    try {
      const r = await askTutor({ task: 'ocr', message: 'Read the question in this image.', language: 'en', imageDataUrl: `data:image/jpeg;base64,${image.base64}` });
      let extracted = r.text;
      try {
        const j = JSON.parse(r.text.replace(/^```json|```$/g, '').trim()); extracted = j.text ?? r.text;
        setOcrMsg(j.uncertain?.length ? `Check these carefully: ${j.uncertain.map((u: { span: string }) => u.span).join(', ')}` : 'Please check the text against the photo.');
      } catch { setOcrMsg('Please check the text against the photo.'); }
      setText(extracted); setOcrPending(true);
    } catch (e) { setOcrMsg(e instanceof TutorError ? e.message : 'Could not read the image. You can type the question instead.'); }
  };

  const save = async () => {
    const input = {
      subject: chapter?.subject ?? 'math', chapterId, questionText: text, imageUri: image?.uri ?? null, correctAnswer: correct,
      officialExplanation: explanation, workingSteps: steps, studentNote: note, category: category ?? undefined, ocrConfirmed: !ocrPending,
    };
    const next: typeof errors = {};
    if (!chapter) next.chapter = 'Choose the chapter this belongs to.';
    if (ocrPending) next.text = 'Confirm that the extracted text matches the photo first.';
    else if (text.trim().length < 3) next.text = 'Write or scan the question.';
    if (!category) next.category = 'Choose why it went wrong.';
    if (Object.keys(next).length) { setErrors(next); return; }
    const v = newMistakeSchema.safeParse(input);
    if (!v.success) { setErrors({ general: v.error.issues[0].message }); return; }
    setBusy(true);
    try { await mistakeRepo.add(db, input as never, toDateKey(new Date())); router.back(); }
    catch (e) { setErrors({ general: e instanceof Error ? e.message : 'Could not save' }); setBusy(false); }
  };

  return (
    <Page keyboardShouldPersistTaps="handled">
      <Group title="1 · Chapter">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {chapters.map((c) => <Chip key={c.id} label={c.title} selected={c.id === chapterId} color={colors[c.subject]} onPress={() => setChapterId(c.id)} />)}
        </View>
        {errors.chapter ? <AppText variant="caption" color={colors.danger} accessibilityRole="alert">{errors.chapter}</AppText> : null}
      </Group>

      <Group title="2 · The question">
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button title="Scan" icon="camera-outline" variant="secondary" onPress={() => pick(true)} style={{ flex: 1 }} />
          <Button title="Import" icon="image-outline" variant="secondary" onPress={() => pick(false)} style={{ flex: 1 }} />
        </View>
        {image ? (
          <View style={{ gap: space.sm }}>
            <Image source={{ uri: image.uri }} accessibilityLabel="Photo of the question" style={{ width: '100%', height: 180, borderRadius: 12 }} resizeMode="contain" />
            <Button title="Extract text with AI" icon="scan-outline" variant="ghost" onPress={extract} />
          </View>
        ) : null}
        {ocrMsg ? <AppText variant="caption">{ocrMsg}</AppText> : null}
        <Field label="Question text" multiline minLines={4} placeholder="Type or paste the question" value={text} onChangeText={setText} error={errors.text} />
        {ocrPending ? <Button title="I checked it. It matches the photo" icon="checkmark-done" variant="secondary" onPress={() => { setOcrPending(false); setErrors((e) => ({ ...e, text: undefined })); }} /> : null}
      </Group>

      <Group title="3 · The right answer">
        <Field label="Correct answer" placeholder="For example B, or 7" value={correct} onChangeText={setCorrect} />
        <Field label="Explanation from your book or teacher" multiline minLines={3} value={explanation} onChangeText={setExplanation} />
      </Group>

      <Group title="4 · What went wrong">
        <Field label="My working" multiline minLines={3} placeholder="Where did it go wrong?" value={steps} onChangeText={setSteps} />
        <View style={{ gap: space.sm }}>
          <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Why was it wrong?</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {MISTAKE_CATEGORIES.map((c) => <Chip key={c} label={CATEGORY_LABEL[c]} selected={category === c} onPress={() => setCategory(c)} />)}
          </View>
          {errors.category ? <AppText variant="caption" color={colors.danger} accessibilityRole="alert">{errors.category}</AppText> : null}
        </View>
        <Field label="Note to yourself (optional)" multiline value={note} onChangeText={setNote} />
      </Group>

      {errors.general ? <Card tone="accent"><AppText variant="body" color={colors.danger} accessibilityRole="alert">{errors.general}</AppText></Card> : null}
      <Button title="Save and schedule revision" icon="save-outline" onPress={save} loading={busy} />
      <AppText variant="caption" style={{ marginTop: space.sm }}>The first revisit is tomorrow, then after 3, 7 and 14 days, adjusted by how you do.</AppText>
    </Page>
  );
}
