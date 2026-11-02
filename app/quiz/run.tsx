import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { AnswerInput } from '../../src/components/design-system/AnswerInput';
import { AppText, Button, Card, Chip, EmptyState, ErrorState, FadeIn, Icon, LoadingState, Page, ProgressBar, SectionHeader, StatTile, SubjectDot, Tag, space, useBottomInset, useLayout, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { attemptIdFor, attemptRepo } from '../../src/database/repositories/attempts';
import { CATEGORY_LABEL, MISTAKE_CATEGORIES, MistakeCategory, mistakeRepo } from '../../src/database/repositories/mistakes';
import { ActiveSession, mockRepo } from '../../src/database/repositories/mocks';
import { PracticeQuestion, questionRepo } from '../../src/database/repositories/questions';
import { scoreExam, topicWeaknesses } from '../../src/features/exam-engine/scoring';
import * as S from '../../src/features/exam-engine/session';
import type { AnswerKeyEntry, ExamResult, QuestionResult } from '../../src/features/exam-engine/types';
import { toDateKey } from '../../src/utils/dates';

const fmtTime = (ms: number) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const keyText = (k: AnswerKeyEntry) => (k.numeric !== undefined ? String(k.numeric) : (k.correct ?? []).join(', '));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface Loaded { active: ActiveSession; qmap: Map<string, PracticeQuestion>; session: S.SessionState; expired: boolean }

export default function QuizRun() {
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const bottom = useBottomInset();
  const { gutter, maxWidth } = useLayout();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [none, setNone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<{ r: ExamResult; active: ActiveSession; startedAt: number } | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [hintText, setHintText] = useState<Record<string, string>>({});
  const [solutions, setSolutions] = useState<Record<string, { explanation: string; key: AnswerKeyEntry }>>({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const finishing = useRef(false);
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [session, setSession] = useState<S.SessionState | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const a = await mockRepo.loadActive(db);
        if (!a) { setNone(true); return; }
        const restored = S.restore(JSON.stringify(a.session), Date.now());
        if (!restored) { await mockRepo.clearActive(db); setNone(true); return; }
        const list = await questionRepo.list(db, { verifiedOnly: false });
        setLoaded({ active: a, qmap: new Map(list.map((q) => [q.id, q])), session: restored.state, expired: restored.expired });
        setActive(a); setSession(restored.state);
      } catch (e) { setError(e instanceof Error ? e.message : 'Could not open the test'); }
    })();
  }, [db]);

  const persist = useCallback(async (a: ActiveSession, s: S.SessionState) => { await mockRepo.saveActive(db, { ...a, session: s }); }, [db]);

  const finishNow = useCallback(async (a: ActiveSession, s0: S.SessionState) => {
    if (finishing.current) return;
    finishing.current = true;
    try {
      const s = S.finish(s0, Date.now());
      const r = scoreExam({ config: a.config, questions: a.questions, responses: s.responses, timeMs: s.timeMs });
      const hinted = new Set(a.hintUsed ?? []);
      for (const q of r.questions) {
        await attemptRepo.record(db, {
          id: attemptIdFor(a.id, q.questionId), questionId: q.questionId, kind: a.mode === 'timed' ? 'exam' : 'practice', outcome: q.outcome, marks: q.marks,
          timeMs: q.timeMs, hintUsed: hinted.has(q.questionId), markedForReview: !!s.marked[q.questionId],
          selected: s.responses[q.questionId]?.selected, numeric: s.responses[q.questionId]?.numeric ?? null, at: new Date(s.finishedAt ?? Date.now()),
        });
      }
      await mockRepo.saveResult(db, { id: a.id, name: a.name, config: a.config, startedAt: s.startedAt, finishedAt: s.finishedAt ?? Date.now(), result: r });
      await mockRepo.clearActive(db);
      const sol: Record<string, { explanation: string; key: AnswerKeyEntry }> = {};
      for (const q of a.questions) { const x = await questionRepo.solution(db, q.id); if (x) sol[q.id] = { explanation: x.explanation, key: x.key }; }
      setSolutions(sol);
      setResult({ r, active: a, startedAt: s.startedAt });
    } catch (e) { finishing.current = false; setError(e instanceof Error ? e.message : 'Could not save your result'); }
  }, [db]);

  useEffect(() => {
    if (!active || !session || result) return;
    if (loaded?.expired) { finishNow(active, session); return; }
    const t = setInterval(() => { const n = Date.now(); setNow(n); if (S.isExpired(session, n)) finishNow(active, session); }, 1000);
    return () => clearInterval(t);
  }, [active, session, result, loaded, finishNow]);

  const act = (fn: (s: S.SessionState, now: number) => S.SessionState) => {
    if (!active || !session) return;
    const next = fn(session, Date.now());
    setSession(next);
    persist(active, next).catch(() => setError('Could not save progress on this device.'));
  };

  const qs = useMemo(() => (active ? active.questions : []), [active]);

  if (error) return <ErrorState message={error} onRetry={() => router.replace('/(tabs)/practice')} />;
  if (none && !result) return <EmptyState icon="document-outline" title="No test in progress" body="Start a practice set or timed test from the Practice tab." action={{ label: 'Back to Practice', onPress: () => router.replace('/(tabs)/practice') }} />;
  if (!active || !session || !loaded) return <LoadingState />;
  if (result) return <ResultView db={db} result={result.r} active={result.active} qmap={loaded.qmap} solutions={solutions} onDone={() => router.replace('/(tabs)/practice')} />;
  if (loaded.expired) return <LoadingState label="Time is up. Saving your answers" />;

  const id = S.currentId(session);
  const q = loaded.qmap.get(id);
  const eq = qs.find((x) => x.id === id)!;
  const timed = active.mode === 'timed';
  const checked = (active.checked ?? []).includes(id);
  const remaining = S.remainingMs(session, now);
  const prog = S.progress(session);
  const response = session.responses[id];
  const last = session.index === session.questionIds.length - 1;

  const check = async () => {
    const sol = await questionRepo.solution(db, id);
    if (sol) setSolutions((p) => ({ ...p, [id]: { explanation: sol.explanation, key: sol.key } }));
    const next = { ...active, checked: [...(active.checked ?? []), id] };
    setActive(next); persist(next, session);
  };
  const getHint = async () => {
    const h = await questionRepo.hint(db, id);
    setHintText((p) => ({ ...p, [id]: h || 'No hint was added for this question.' }));
    if (!(active.hintUsed ?? []).includes(id)) { const next = { ...active, hintUsed: [...(active.hintUsed ?? []), id] }; setActive(next); persist(next, session); }
  };
  const submit = () => finishNow(active, session);
  const askSubmit = () => {
    const msg = `${prog.answered} of ${prog.total} answered${prog.marked ? `, ${prog.marked} marked for review` : ''}. Submit now?`;
    if (Platform.OS === 'web') { setConfirmSubmit(true); return; }
    Alert.alert('Submit test', msg, [{ text: 'Keep going', style: 'cancel' }, { text: 'Submit', style: 'destructive', onPress: submit }]);
  };

  const feedback = !timed && checked ? solutions[id] : undefined;
  const palStyle = (st: S.PaletteStatus) => ({
    answered: { bg: colors.successTint, edge: colors.success }, answered_marked: { bg: colors.physicsTint, edge: colors.physics },
    marked: { bg: colors.warningTint, edge: colors.warning }, visited: { bg: colors.surfaceAlt, edge: colors.controlBorder }, unvisited: { bg: colors.surface, edge: colors.border },
  }[st]);
  const outcome = feedback ? scoreExam({ config: active.config, questions: [eq], responses: { [id]: response } }).questions[0] : null;
  const lowTime = remaining !== null && remaining < 60_000;
  const wrap = { width: '100%' as const, maxWidth, alignSelf: 'center' as const, paddingHorizontal: gutter };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface }}>
        <View style={[wrap, { paddingVertical: space.sm, gap: space.sm }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Question {session.index + 1} of {prog.total} · {prog.answered} answered</AppText>
            {remaining !== null && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.sm, paddingVertical: space.xs, borderRadius: 999, backgroundColor: lowTime ? colors.dangerTint : colors.surfaceAlt }}
                accessible accessibilityLabel={`Time left ${fmtTime(remaining)}`} accessibilityLiveRegion={lowTime ? 'polite' : 'none'}>
                <Icon name="timer-outline" size="sm" color={lowTime ? colors.danger : colors.text} />
                <AppText variant="body" style={{ fontWeight: '700' }} color={lowTime ? colors.danger : colors.text}>{fmtTime(remaining)}</AppText>
              </View>
            )}
          </View>
          <ProgressBar value={(session.index + 1) / prog.total} color={colors.accentStrong} label="Question progress" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: space.xl }}>
        <View style={[wrap, { paddingTop: space.md, gap: space.md }]}>
          {q ? (
            <FadeIn key={id}>
              <View style={{ gap: space.md }}>
                <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap', alignItems: 'center' }}>
                  <SubjectDot subject={q.subject} />
                  <AppText variant="label" color={colors[q.subject]}>{q.chapterTitle}</AppText>
                  <Tag tone="accent" label={cap(q.difficulty)} />
                  {q.origin !== 'student' && <Tag label={q.origin === 'official' ? 'Official paper' : 'Coaching'} />}
                </View>
                <Card><AppText variant="body" style={{ fontSize: 17, lineHeight: 26 }} selectable>{q.stem}</AppText></Card>
                <AnswerInput type={q.type} options={q.options} value={response} locked={!timed && checked}
                  onChange={(r) => act((s, n) => S.answer(s, r, n))} revealCorrect={!!feedback} correct={feedback?.key.correct} />

                {!timed && !checked && (
                  <View style={{ gap: space.sm }}>
                    {hintText[id] ? <Card tone="accent" style={{ flexDirection: 'row', gap: space.sm }}><Icon name="bulb-outline" size="md" color={colors.onAccent} /><AppText variant="body" color={colors.onAccent} style={{ flex: 1 }}>{hintText[id]}</AppText></Card>
                      : q.hasHint ? <Button variant="ghost" icon="bulb-outline" title="Show hint" onPress={getHint} /> : null}
                    <Button title="Check answer" icon="checkmark-done" onPress={check} disabled={!S.progress({ ...session, questionIds: [id] }).answered} />
                  </View>
                )}

                {feedback && outcome && (
                  <Card style={{ backgroundColor: outcome.outcome === 'correct' ? colors.successTint : outcome.outcome === 'partial' ? colors.warningTint : colors.dangerTint,
                    borderColor: outcome.outcome === 'correct' ? colors.success : outcome.outcome === 'partial' ? colors.warning : colors.danger, borderWidth: 2, gap: space.xs }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                      <Icon name={outcome.outcome === 'correct' ? 'checkmark-circle' : outcome.outcome === 'partial' ? 'remove-circle' : 'close-circle'} size="lg"
                        color={outcome.outcome === 'correct' ? colors.success : outcome.outcome === 'partial' ? colors.warning : colors.danger} />
                      <AppText variant="heading" accessibilityRole="alert">{outcome.outcome === 'correct' ? 'Correct' : outcome.outcome === 'partial' ? 'Partly correct' : 'Not quite'}</AppText>
                    </View>
                    <AppText variant="body">Correct answer: <Text style={{ fontWeight: '700' }}>{keyText(feedback.key)}</Text></AppText>
                    {feedback.explanation ? <AppText variant="body">{feedback.explanation}</AppText> : <AppText variant="caption" color={colors.text}>No explanation was saved for this question.</AppText>}
                    <AppText variant="caption" color={colors.text}>Topic: {q.chapterTitle}</AppText>
                    {outcome.outcome !== 'correct' && <SaveToErrorBook db={db} q={q} answer={keyText(feedback.key)} explanation={feedback.explanation} />}
                  </Card>
                )}
              </View>
            </FadeIn>
          ) : <ErrorState message="This question is no longer available." />}

          {showPalette && (
            <Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {session.questionIds.map((qid, i) => (
                  <Pressable key={qid} accessibilityRole="button" accessibilityLabel={`Question ${i + 1}, ${S.paletteStatus(session, qid).replace('_', ' ')}`}
                    onPress={() => { act((s, n) => S.goTo(s, i, n)); setShowPalette(false); }}
                    style={{ width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palStyle(S.paletteStatus(session, qid)).bg,
                      borderWidth: i === session.index ? 3 : 1.5, borderColor: i === session.index ? colors.primary : palStyle(S.paletteStatus(session, qid)).edge }}>
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{i + 1}</Text>
                  </Pressable>
                ))}
              </View>
              <AppText variant="caption" style={{ marginTop: space.sm }}>Green answered · amber marked · violet answered and marked · grey seen · thick outline is the current question</AppText>
            </Card>
          )}
          {confirmSubmit && (
            <Card tone="accent">
              <AppText variant="body" color={colors.onAccent}>{prog.answered} of {prog.total} answered. Submit now?</AppText>
              <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm }}>
                <Button title="Keep going" variant="ghost" onPress={() => setConfirmSubmit(false)} style={{ flex: 1 }} />
                <Button title="Submit" onPress={submit} style={{ flex: 1 }} />
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
        <View style={[wrap, { paddingTop: space.sm, paddingBottom: space.sm + bottom, gap: space.sm }]}>
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            <ToolButton icon="chevron-back" label="Back" disabled={session.index === 0} onPress={() => act((s, n) => S.goTo(s, s.index - 1, n))} />
            {timed && <ToolButton icon={session.marked[id] ? 'flag' : 'flag-outline'} label={session.marked[id] ? 'Unmark' : 'Mark'} active={!!session.marked[id]} onPress={() => act((s, n) => S.toggleMark(s, n))} />}
            {timed && !checked && <ToolButton icon="close-circle-outline" label="Clear" disabled={!response} onPress={() => act((s, n) => S.clearAnswer(s, n))} />}
            <ToolButton icon="grid-outline" label={showPalette ? 'Hide' : 'List'} active={showPalette} onPress={() => setShowPalette(!showPalette)} />
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {!last && <Button title="Next" icon="chevron-forward" onPress={() => act((s, n) => S.goTo(s, s.index + 1, n))} style={{ flex: 1 }} />}
            <Button title={timed ? 'Submit test' : 'Finish'} variant={last ? 'primary' : 'secondary'} icon="flag-outline" onPress={askSubmit} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

/** Compact icon-over-label control for the bottom bar. Labels never wrap, even at large text sizes. */
function ToolButton({ icon, label, onPress, disabled, active }: { icon: React.ComponentProps<typeof Icon>['name']; label: string; onPress: () => void; disabled?: boolean; active?: boolean }) {
  const { colors } = useTheme();
  const fg = active ? colors.onAccent : colors.accentStrong;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, selected: !!active }} disabled={disabled} onPress={onPress}
      android_ripple={{ color: colors.border }}
      style={{ flex: 1, minHeight: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 4, opacity: disabled ? 0.4 : 1, backgroundColor: active ? colors.accent : 'transparent' }}>
      <Icon name={icon} size="md" color={fg} />
      <Text numberOfLines={1} maxFontSizeMultiplier={1.2} style={{ color: fg, fontSize: 12, lineHeight: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

function SaveToErrorBook({ db, q, answer, explanation }: { db: ReturnType<typeof useDb>; q: PracticeQuestion; answer: string; explanation: string }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (done) return <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'center', marginTop: space.sm }}><Icon name="bookmark" size="sm" color={colors.text} /><AppText variant="caption" color={colors.text}>Saved. First revision is tomorrow.</AppText></View>;
  const save = async (category: MistakeCategory) => {
    try {
      await mistakeRepo.add(db, { subject: q.subject, chapterId: q.chapterId, questionId: q.id, questionText: q.stem, correctAnswer: answer, officialExplanation: explanation, category } as never, toDateKey(new Date()));
      setDone(true);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not save'); }
  };
  return (
    <View style={{ marginTop: space.sm, gap: space.sm }}>
      {!open ? <Button title="Save to Error Book" icon="bookmark-outline" variant="secondary" onPress={() => setOpen(true)} /> : (
        <>
          <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>Why was it wrong?</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {MISTAKE_CATEGORIES.map((c) => <Chip key={c} label={CATEGORY_LABEL[c]} onPress={() => save(c)} />)}
          </View>
        </>
      )}
      {err ? <AppText variant="caption" color={colors.danger}>{err}</AppText> : null}
    </View>
  );
}

function ResultView({ db, result, active, qmap, solutions, onDone }: {
  db: ReturnType<typeof useDb>; result: ExamResult; active: ActiveSession; qmap: Map<string, PracticeQuestion>;
  solutions: Record<string, { explanation: string; key: AnswerKeyEntry }>; onDone: () => void;
}) {
  const { colors } = useTheme();
  const weak = topicWeaknesses(result).filter((w) => w.ratio < 1);
  const titleOf = (topicId: string) => Array.from(qmap.values()).find((q) => q.chapterId === topicId)?.chapterTitle ?? topicId;
  const subjectName = { math: 'Mathematics', physics: 'Physics', chemistry: 'Chemistry' } as const;
  const tone = (o: QuestionResult['outcome']) => (o === 'correct' ? 'success' : o === 'partial' ? 'warning' : o === 'incorrect' ? 'danger' : 'neutral') as 'success' | 'warning' | 'danger' | 'neutral';

  return (
    <Page>
      <FadeIn>
        <Card tone="hero">
          <AppText variant="label" color={colors.accent}>{active.name} · result</AppText>
          <AppText variant="display" color={colors.onPrimary} style={{ marginTop: space.xs }}>{result.totalMarks} / {result.maxMarks}</AppText>
          <AppText variant="body" color={colors.onPrimary}>marks</AppText>
        </Card>
      </FadeIn>
      <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' }}>
        <StatTile label="Score" value={`${result.percentage}%`} hint="of the maximum marks" />
        <StatTile label="Accuracy" value={`${result.accuracy}%`} hint="of questions you attempted were fully correct" />
      </View>
      <AppText variant="caption" style={{ marginTop: space.sm }}>These differ on purpose: score counts marks, accuracy counts only the questions you tried.</AppText>

      <Card style={{ marginTop: space.md, gap: space.sm }}>
        <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
          <Tag tone="success" label={`${result.correct} correct`} />
          {result.partial > 0 && <Tag tone="warning" label={`${result.partial} partly`} />}
          <Tag tone="danger" label={`${result.incorrect} wrong`} />
          <Tag label={`${result.unanswered} skipped`} />
        </View>
        <AppText variant="body">Attempt rate {result.attemptRate}% · negative marks lost {result.negativeLost}</AppText>
        <AppText variant="body">Time {fmtTime(result.totalTimeMs)} · average {fmtTime(result.avgTimePerAttemptedMs)} per attempted question</AppText>
      </Card>

      <SectionHeader title="By subject" icon="school-outline" />
      {result.subjects.map((s) => (
        <Card key={s.subject} tone={s.subject} style={{ marginBottom: space.sm, gap: space.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}><SubjectDot subject={s.subject} size={12} /><AppText variant="heading" color={colors[s.subject]}>{subjectName[s.subject]}</AppText></View>
          <AppText variant="body">{s.marks} / {s.maxMarks} · {s.correct} correct, {s.incorrect} wrong, {s.unanswered} skipped</AppText>
          <ProgressBar value={s.maxMarks ? Math.max(0, s.marks) / s.maxMarks : 0} color={colors[s.subject]} label={`${subjectName[s.subject]} marks`} />
        </Card>
      ))}

      {weak.length > 0 && (<>
        <SectionHeader title="Where marks were lost" icon="trending-down-outline" />
        <Card style={{ gap: space.xs }}>{weak.map((w) => <AppText key={w.topicId} variant="body">{titleOf(w.topicId)}: {Math.round(w.ratio * 100)}% of its marks</AppText>)}</Card>
      </>)}

      <SectionHeader title="Review" icon="list-outline" />
      {result.questions.map((r, i) => {
        const q = qmap.get(r.questionId);
        const sol = solutions[r.questionId];
        return (
          <Card key={r.questionId} style={{ marginBottom: space.sm, gap: space.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm }}>
              <AppText variant="label">Q{i + 1} · {q?.chapterTitle}</AppText>
              <Tag tone={tone(r.outcome)} label={`${r.outcome === 'unanswered' ? 'Skipped' : cap(r.outcome)} · ${r.marks > 0 ? '+' : ''}${r.marks}`} />
            </View>
            <AppText variant="body">{q?.stem}</AppText>
            {sol && <AppText variant="caption">Answer: {keyText(sol.key)}{sol.explanation ? `. ${sol.explanation}` : ''}</AppText>}
            {q && sol && r.outcome !== 'correct' && <SaveToErrorBook db={db} q={q} answer={keyText(sol.key)} explanation={sol.explanation} />}
          </Card>
        );
      })}
      <Button title="Done" icon="checkmark" onPress={onDone} style={{ marginTop: space.sm }} />
    </Page>
  );
}
