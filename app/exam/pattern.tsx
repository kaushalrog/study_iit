import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, Chip, ErrorState, Field, Group, Icon, LoadingState, Page, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { examRepo } from '../../src/database/repositories/exams';
import { examMaxMarks } from '../../src/features/exam-engine/scoring';
import { ExamConfig, ExamSection, QUESTION_TYPES, SUBJECT_KEYS } from '../../src/features/exam-engine/types';

const TYPE_LABEL: Record<string, string> = { single: 'Single correct', multi: 'Multiple correct', integer: 'Integer', matching: 'Matching', assertion_reason: 'Assertion-reason' };
const num = (s: string): number => (s.trim() === '' || s === '-' ? NaN : Number(s));
const L = (s: string) => <AppText variant="caption" style={{ fontWeight: '600' }}>{s}</AppText>;

/** Edit an exam pattern. Nothing is pre-filled for Main-style: the student enters what her paper's instructions say. */
export default function PatternEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const [cfg, setCfg] = useState<ExamConfig | null>(null);
  const [verified, setVerified] = useState(false);
  const [note, setNote] = useState('');
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await examRepo.templateConfig(db, id);
        const t = (await examRepo.templates(db)).find((x) => x.id === id);
        if (!c || !t) { setLoadErr('This pattern was not found.'); return; }
        setCfg(c); setVerified(t.verification === 'verified'); setNote(t.sourceNote ?? '');
      } catch (e) { setLoadErr(e instanceof Error ? e.message : 'Could not load'); }
    })();
  }, [db, id]);

  if (loadErr) return <ErrorState message={loadErr} />;
  if (!cfg) return <LoadingState />;

  const setSec = (i: number, patch: Partial<ExamSection>) => setCfg({ ...cfg, sections: cfg.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const setRule = (i: number, patch: Partial<ExamSection['rule']>) => setSec(i, { rule: { ...cfg.sections[i].rule, ...patch } });
  const addSection = () => {
    let n = cfg.sections.length + 1;
    while (cfg.sections.some((s) => s.id === `s${n}`)) n++;
    setCfg({ ...cfg, sections: [...cfg.sections, { id: `s${n}`, name: `Section ${cfg.sections.length + 1}`, subject: 'physics', questionType: 'single', questionCount: 5, attemptLimit: null, rule: { correct: 4, incorrect: cfg.negativeMarkingEnabled ? -1 : 0, unanswered: 0, partialPerCorrectOption: null } }] });
  };
  let max: number | null = null;
  try { max = examMaxMarks(cfg); } catch { max = null; }

  const save = async () => {
    setBusy(true); setErr(null);
    try {
      await examRepo.saveTemplate(db, id, cfg, { verified, sourceNote: note.trim() || undefined });
      router.back();
    } catch (e) { setErr(e instanceof Error ? e.message.slice(0, 300) : 'Could not save'); setBusy(false); }
  };

  return (
    <Page keyboardShouldPersistTaps="handled">
      <AppText variant="display">Exam pattern</AppText>
      <AppText variant="caption" style={{ marginBottom: space.md }}>Enter the marking exactly as your paper's instructions print it. ORBIT does not assume an official scheme.</AppText>

      <Group title="Paper">
        <Field label="Name" value={cfg.name} onChangeText={(t) => setCfg({ ...cfg, name: t })} />
        <Field label="Duration in minutes" keyboardType="number-pad" value={cfg.durationMinutes === null ? '' : String(cfg.durationMinutes)}
          onChangeText={(t) => setCfg({ ...cfg, durationMinutes: t.trim() === '' ? null : Math.round(num(t)) })} hint="Leave empty for untimed." />
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <Chip label={cfg.negativeMarkingEnabled ? 'Negative marking on' : 'Negative marking off'} selected={cfg.negativeMarkingEnabled}
            onPress={() => setCfg({ ...cfg, negativeMarkingEnabled: !cfg.negativeMarkingEnabled })} />
        </View>
        <AppText variant="caption">Maximum marks: {max === null ? 'check the sections' : max}</AppText>
      </Group>

      {cfg.sections.length === 0 && <Card style={{ marginBottom: space.md }}><AppText variant="body">No sections yet. Add one for each part of the paper.</AppText></Card>}

      {cfg.sections.map((s, i) => (
        <Group key={s.id} title={`Section ${i + 1}`}>
          <Field label="Section name" value={s.name} onChangeText={(t) => setSec(i, { name: t })} />
          {L('Subject')}
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            {SUBJECT_KEYS.map((k) => <Chip key={k} label={k[0].toUpperCase() + k.slice(1)} color={colors[k]} selected={s.subject === k} onPress={() => setSec(i, { subject: k })} />)}
          </View>
          {L('Question type')}
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            {QUESTION_TYPES.map((t) => <Chip key={t} label={TYPE_LABEL[t]} selected={s.questionType === t} onPress={() => setSec(i, { questionType: t, rule: t === 'multi' ? s.rule : { ...s.rule, partialPerCorrectOption: null } })} />)}
          </View>
          <Field label="Number of questions" keyboardType="number-pad" value={String(s.questionCount || '')} onChangeText={(t) => setSec(i, { questionCount: Math.round(num(t)) || 0 })} />
          <Field label="Must attempt (optional)" keyboardType="number-pad" value={s.attemptLimit === null ? '' : String(s.attemptLimit)}
            onChangeText={(t) => setSec(i, { attemptLimit: t.trim() === '' ? null : Math.round(num(t)) || null })} hint="Only if your paper lets you skip some questions." />
          <Field label="Marks for correct" keyboardType="decimal-pad" value={String(s.rule.correct)} onChangeText={(t) => setRule(i, { correct: num(t) })} />
          <Field label="Marks for wrong (0 or negative)" keyboardType="numbers-and-punctuation" value={String(s.rule.incorrect)} onChangeText={(t) => setRule(i, { incorrect: num(t) })} />
          <Field label="Marks for unanswered" keyboardType="numbers-and-punctuation" value={String(s.rule.unanswered)} onChangeText={(t) => setRule(i, { unanswered: num(t) })} />
          {s.questionType === 'multi' && (
            <Field label="Partial marks per correct option" keyboardType="decimal-pad" value={s.rule.partialPerCorrectOption === null ? '' : String(s.rule.partialPerCorrectOption)}
              onChangeText={(t) => setRule(i, { partialPerCorrectOption: t.trim() === '' ? null : num(t) })} hint="Leave empty if there is no partial marking." />
          )}
          <Button title="Remove this section" icon="trash-outline" variant="ghost" onPress={() => setCfg({ ...cfg, sections: cfg.sections.filter((_, j) => j !== i) })} />
        </Group>
      ))}
      <Button title="Add a section" icon="add-circle-outline" variant="secondary" onPress={addSection} style={{ marginBottom: space.md }} />

      <Group title="Have you checked this?">
        <Chip label={verified ? 'I checked this against my paper instructions' : 'Not checked yet'} selected={verified} onPress={() => setVerified(!verified)} />
        <Field label="Where did it come from? (optional)" value={note} onChangeText={setNote} placeholder="e.g. instruction page of the class test" />
      </Group>

      {err ? <View style={{ flexDirection: 'row', gap: space.sm, marginBottom: space.sm }}><Icon name="alert-circle" size="md" color={colors.danger} /><AppText variant="body" color={colors.danger} accessibilityRole="alert" style={{ flex: 1 }}>{err}</AppText></View> : null}
      <Button title="Save pattern" icon="checkmark" onPress={save} loading={busy} />
    </Page>
  );
}
