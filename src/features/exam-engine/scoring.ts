import {
  ExamConfig,
  ExamQuestion,
  ExamResult,
  ExamSection,
  Outcome,
  QuestionResult,
  Response,
  ScoringRule,
  SubjectKey,
  SubjectSummary,
  AnswerKeyEntry,
} from './types';

export interface ScoredQuestion {
  outcome: Outcome;
  marks: number;
}

const norm = (xs: string[] | undefined): string[] =>
  Array.from(new Set((xs ?? []).map((x) => x.trim().toUpperCase()).filter(Boolean))).sort();

export function isAnswered(type: ExamSection['questionType'], r: Response | undefined): boolean {
  if (!r) return false;
  if (type === 'integer') return r.numeric !== undefined && r.numeric !== null && Number.isFinite(r.numeric);
  return norm(r.selected).length > 0;
}

/** Score a single response against a key under a rule. Pure function — no UI or storage. */
export function scoreQuestion(
  type: ExamSection['questionType'],
  rule: ScoringRule,
  key: AnswerKeyEntry,
  response: Response | undefined,
): ScoredQuestion {
  if (!isAnswered(type, response)) {
    return { outcome: 'unanswered', marks: rule.unanswered };
  }

  if (type === 'integer') {
    const tol = key.tolerance ?? 0;
    const ok = key.numeric !== undefined && Math.abs((response!.numeric as number) - key.numeric) <= tol;
    return ok
      ? { outcome: 'correct', marks: rule.correct }
      : { outcome: 'incorrect', marks: rule.incorrect };
  }

  const picked = norm(response!.selected);
  const correct = norm(key.correct);

  if (type !== 'multi') {
    // single / matching / assertion_reason: exactly one option must equal the key
    const ok = picked.length === 1 && correct.length === 1 && picked[0] === correct[0];
    return ok
      ? { outcome: 'correct', marks: rule.correct }
      : { outcome: 'incorrect', marks: rule.incorrect };
  }

  // multi-correct
  const anyWrong = picked.some((p) => !correct.includes(p));
  if (anyWrong) return { outcome: 'incorrect', marks: rule.incorrect };
  if (picked.length === correct.length) return { outcome: 'correct', marks: rule.correct };
  if (rule.partialPerCorrectOption !== null) {
    // Only correct options chosen, but not all of them.
    return { outcome: 'partial', marks: Math.min(rule.correct, picked.length * rule.partialPerCorrectOption) };
  }
  return { outcome: 'incorrect', marks: rule.incorrect };
}

export function sectionMaxMarks(s: ExamSection): number {
  return (s.attemptLimit ?? s.questionCount) * s.rule.correct;
}

export function examMaxMarks(config: ExamConfig): number {
  return config.sections.reduce((sum, s) => sum + sectionMaxMarks(s), 0);
}

export interface ScoreInput {
  config: ExamConfig;
  /** Questions in paper order. */
  questions: ExamQuestion[];
  responses: Record<string, Response | undefined>;
  /** Milliseconds spent per question id. */
  timeMs?: Record<string, number>;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const pct = (num: number, den: number) => (den > 0 ? round2((num / den) * 100) : 0);

export function scoreExam({ config, questions, responses, timeMs = {} }: ScoreInput): ExamResult {
  const sections = new Map(config.sections.map((s) => [s.id, s]));
  const attemptedInSection = new Map<string, number>();
  const results: QuestionResult[] = [];

  for (const q of questions) {
    const section = sections.get(q.sectionId);
    if (!section) throw new Error(`Question ${q.id} references unknown section ${q.sectionId}`);
    const response = responses[q.id];
    let scored = scoreQuestion(section.questionType, section.rule, q.key, response);

    // Optional-question rule: only the first `attemptLimit` attempted questions are evaluated.
    if (scored.outcome !== 'unanswered' && section.attemptLimit !== null) {
      const used = attemptedInSection.get(section.id) ?? 0;
      if (used >= section.attemptLimit) scored = { outcome: 'unanswered', marks: 0 };
      else attemptedInSection.set(section.id, used + 1);
    }

    const rule = config.negativeMarkingEnabled ? section.rule : { ...section.rule, incorrect: 0 };
    if (!config.negativeMarkingEnabled && scored.outcome === 'incorrect') scored = { ...scored, marks: rule.incorrect };

    results.push({
      questionId: q.id,
      sectionId: q.sectionId,
      subject: section.subject,
      topicId: q.topicId,
      outcome: scored.outcome,
      marks: scored.marks,
      maxMarks: section.rule.correct,
      negativeLost: scored.marks < 0 ? -scored.marks : 0,
      timeMs: timeMs[q.id] ?? 0,
    });
  }

  const subjectMap = new Map<SubjectKey, SubjectSummary>();
  for (const s of config.sections) {
    const cur =
      subjectMap.get(s.subject) ??
      { subject: s.subject, marks: 0, maxMarks: 0, correct: 0, partial: 0, incorrect: 0, unanswered: 0, negativeLost: 0 };
    cur.maxMarks += sectionMaxMarks(s);
    subjectMap.set(s.subject, cur);
  }
  for (const r of results) {
    const s = subjectMap.get(r.subject)!;
    s.marks += r.marks;
    s.negativeLost += r.negativeLost;
    s[r.outcome] += 1;
  }
  const subjects = Array.from(subjectMap.values()).map((s) => ({ ...s, marks: round2(s.marks), negativeLost: round2(s.negativeLost) }));

  const count = (o: Outcome) => results.filter((r) => r.outcome === o).length;
  const correct = count('correct');
  const partial = count('partial');
  const incorrect = count('incorrect');
  const unanswered = count('unanswered');
  const attempted = correct + partial + incorrect;
  const totalMarks = round2(results.reduce((a, r) => a + r.marks, 0));
  const maxMarks = examMaxMarks(config);
  const totalTimeMs = results.reduce((a, r) => a + r.timeMs, 0);
  const attemptedTime = results.filter((r) => r.outcome !== 'unanswered').reduce((a, r) => a + r.timeMs, 0);

  return {
    questions: results,
    subjects,
    totalMarks,
    maxMarks,
    percentage: pct(totalMarks, maxMarks),
    accuracy: pct(correct, attempted),
    attemptRate: pct(attempted, results.length),
    correct,
    partial,
    incorrect,
    unanswered,
    negativeLost: round2(results.reduce((a, r) => a + r.negativeLost, 0)),
    totalTimeMs,
    avgTimePerAttemptedMs: attempted > 0 ? Math.round(attemptedTime / attempted) : 0,
  };
}

/** Topic-wise weakness ranking from an exam result: lowest (marks / maxMarks) first. */
export function topicWeaknesses(result: ExamResult): { topicId: string; marks: number; maxMarks: number; ratio: number }[] {
  const m = new Map<string, { marks: number; maxMarks: number }>();
  for (const q of result.questions) {
    if (!q.topicId) continue;
    const cur = m.get(q.topicId) ?? { marks: 0, maxMarks: 0 };
    cur.marks += q.marks;
    cur.maxMarks += q.maxMarks;
    m.set(q.topicId, cur);
  }
  return Array.from(m, ([topicId, v]) => ({ topicId, ...v, ratio: v.maxMarks > 0 ? v.marks / v.maxMarks : 0 }))
    .sort((a, b) => a.ratio - b.ratio);
}

/** Pre-flight check: does the supplied paper match its configuration? */
export function validatePaper(config: ExamConfig, questions: ExamQuestion[]): string[] {
  const issues: string[] = [];
  for (const s of config.sections) {
    const n = questions.filter((q) => q.sectionId === s.id).length;
    if (n !== s.questionCount) issues.push(`Section "${s.name}" expects ${s.questionCount} questions but has ${n}.`);
  }
  return issues;
}
