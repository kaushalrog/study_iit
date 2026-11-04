import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { AppText, Button, Card, Chip, ErrorState, Field, Group, Icon, LoadingState, Page, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { newQuestionSchema, OPTION_KEYS, questionRepo } from '../../src/database/repositories/questions';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { useAsync } from '../../src/hooks/useAsync';
import type { QuestionType } from '../../src/features/exam-engine/types';

const TYPES: [QuestionType, string][] = [['single', 'Single correct'], ['multi', 'Multiple correct'], ['integer', 'Integer'], ['matching', 'Matching'], ['assertion_reason', 'Assertion–reason']];

export default function NewQuestion() {
  const params = useLocalSearchParams<{ chapterId?: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const { data: chapters, error, reload } = useAsync(() => syllabusRepo.chapters(db), [db]);

  const [chapterId, setChapterId] = useState(params.chapterId ?? '');
  const [type, setType] = useState<QuestionType>('single');
  const [stem, setStem] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState<string[]>([]);
  const [numeric, setNumeric] = useState('');
  const [difficulty, setDifficulty] = useState<'foundation' | 'main' | 'advanced'>('main');
  const [origin, setOrigin] = useState<'official' | 'coaching' | 'student'>('coaching');
  const [explanation, setExplanation] = useState('');
  const [hint, setHint] = useState('');
  const [sourceNote, setSourceNote] = useState('');
  const [verified, setVerified] = useState(false);
  const [examCategory, setExamCategory] = useState<'jee_main' | 'jee_advanced' | 'other_official' | null>(null);
  const [examYear, setExamYear] = useState('');
  const [examSession, setExamSession] = useState('');
  const [citation, setCitation] = useState('');
  const [citationUrl, setCitationUrl] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saved, setSaved] = useState(0);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!chapters) return <LoadingState />;

  const toggleCorrect = (k: string) => setCorrect((c) => (type === 'multi' ? (c.includes(k) ? c.filter((x) => x !== k) : [...c, k]) : [k]));

  const save = async () => {
    const input = { chapterId, type, stem, options, correct, numeric: numeric.trim() === '' || !Number.isFinite(Number(numeric)) ? null : Number(numeric), difficulty, origin, explanation, hint, sourceNote, verified,
      examCategory: origin === 'official' ? examCategory : null, examYear: origin === 'official' && examYear.trim() ? Number(examYear) : null, examSession, citation, citationUrl };
    const v = newQuestionSchema.safeParse(input);
    if (!v.success) { setMsg({ ok: false, text: v.error.issues[0].message }); return; }
    try {
      await questionRepo.add(db, input);
      setSaved((n) => n + 1);
      setStem(''); setOptions(['', '', '', '']); setCorrect([]); setNumeric(''); setExplanation(''); setHint('');
      setMsg({ ok: true, text: verified ? 'Saved and added to the practice bank.' : 'Saved as unconfirmed. It will not appear in practice until you confirm its answer key.' });
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not save' }); }
  };

  return (
    <Page keyboardShouldPersistTaps="handled">
      <Card tone="accent" style={{ marginBottom: space.md, flexDirection: 'row', gap: space.sm }}>
        <Icon name="shield-checkmark-outline" size="md" color={colors.onAccent} />
        <AppText variant="caption" color={colors.onAccent} style={{ flex: 1 }}>Copy questions from your coaching papers or books. ORBIT never makes up answer keys: you enter the key and confirm it.</AppText>
      </Card>

      <Group title="Where it belongs">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {chapters.map((c) => <Chip key={c.id} label={c.title} selected={c.id === chapterId} color={colors[c.subject]} onPress={() => setChapterId(c.id)} />)}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {TYPES.map(([t, l]) => <Chip key={t} label={l} selected={type === t} onPress={() => { setType(t); setCorrect([]); }} />)}
        </View>
      </Group>

      <Group title="Question and answer">
        <Field label="Question" multiline minLines={4} placeholder="Type the question" value={stem} onChangeText={setStem} />
        {type === 'integer' ? (
          <Field label="Correct numerical answer" keyboardType="numbers-and-punctuation" value={numeric} onChangeText={setNumeric} />
        ) : (
          <View style={{ gap: space.sm }}>
            <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Options. Tap a letter to mark it correct</AppText>
            {options.map((o, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
                <View style={{ width: 76, paddingBottom: space.xs }}><Chip label={OPTION_KEYS[i]} selected={correct.includes(OPTION_KEYS[i])} color={colors.success} onPress={() => toggleCorrect(OPTION_KEYS[i])} /></View>
                <View style={{ flex: 1 }}><Field label={`Option ${OPTION_KEYS[i]}`} value={o} onChangeText={(t) => setOptions((p) => p.map((x, j) => (j === i ? t : x)))} /></View>
              </View>
            ))}
            {options.length < 6 && <Button variant="ghost" icon="add" title="Add option" onPress={() => setOptions((p) => [...p, ''])} />}
          </View>
        )}
      </Group>

      <Group title="Details">
        <View style={{ gap: space.sm }}>
          <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Level</AppText>
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            {(['foundation', 'main', 'advanced'] as const).map((d) => <Chip key={d} label={d.charAt(0).toUpperCase() + d.slice(1)} selected={difficulty === d} onPress={() => setDifficulty(d)} />)}
          </View>
          <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Where is it from?</AppText>
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            {([['official', 'Official paper'], ['coaching', 'Coaching material'], ['student', 'My own']] as const).map(([o, l]) => <Chip key={o} label={l} selected={origin === o} onPress={() => setOrigin(o)} />)}
          </View>
        </View>
        {origin === 'official' && (
          <View style={{ gap: space.sm }}>
            <AppText variant="caption" color={colors.textMuted}>An official question needs a trace. Without exam, year and where you found it, it is not counted as a previous-year question.</AppText>
            <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
              {([['jee_main', 'JEE Main'], ['jee_advanced', 'JEE Advanced'], ['other_official', 'Other exam']] as const).map(([k, l]) => <Chip key={k} label={l} selected={examCategory === k} onPress={() => setExamCategory(k)} />)}
            </View>
            <Field label="Exam year" keyboardType="number-pad" value={examYear} onChangeText={setExamYear} />
            <Field label="Session or shift (optional)" value={examSession} onChangeText={setExamSession} />
            <Field label="Where did you find it?" placeholder="Paper name, shift, question number" value={citation} onChangeText={setCitation} />
            <Field label="Link to the paper (optional)" autoCapitalize="none" value={citationUrl} onChangeText={setCitationUrl} />
          </View>
        )}
        <Field label="Source" placeholder="Book name and page" value={sourceNote} onChangeText={setSourceNote} />
        <Field label="Explanation (optional)" multiline minLines={3} value={explanation} onChangeText={setExplanation} />
        <Field label="Hint (optional)" hint="A nudge that doesn't give the answer away" multiline value={hint} onChangeText={setHint} />
      </Group>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md }}>
        <View style={{ flex: 1 }}>
          <AppText variant="body" style={{ fontWeight: '600' }}>I checked this answer key against my book or teacher</AppText>
          <AppText variant="caption">Only confirmed questions are used in practice and in mastery.</AppText>
        </View>
        <Switch value={verified} onValueChange={setVerified} accessibilityLabel="Answer key confirmed" trackColor={{ true: colors.accentStrong, false: colors.controlBorder }} />
      </Card>

      {msg ? (
        <Card tone={msg.ok ? 'default' : 'accent'} style={{ marginBottom: space.md, flexDirection: 'row', gap: space.sm }}>
          <Icon name={msg.ok ? 'checkmark-circle' : 'alert-circle'} size="md" color={msg.ok ? colors.success : colors.danger} />
          <AppText variant="body" style={{ flex: 1 }} accessibilityRole="alert" color={msg.ok ? colors.text : colors.danger}>{msg.text}</AppText>
        </Card>
      ) : null}
      <Button title="Save question" icon="save-outline" onPress={save} />
      {saved > 0 && <Button title={`Done (${saved} saved)`} variant="secondary" icon="checkmark-done" onPress={() => router.back()} style={{ marginTop: space.sm }} />}
    </Page>
  );
}
