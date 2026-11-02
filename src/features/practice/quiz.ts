import type { AnswerKeyEntry, ExamConfig, ExamQuestion, ExamSection, QuestionType, SubjectKey } from '../exam-engine/types';

export type Difficulty = 'foundation' | 'main' | 'advanced';

export interface BankQuestion {
  id: string;
  chapterId: string;
  subject: SubjectKey;
  topicId?: string | null;
  type: QuestionType;
  difficulty: Difficulty;
  verified: boolean;
}

const RANK: Record<Difficulty, number> = { foundation: 0, main: 1, advanced: 2 };

/** Deterministic PRNG so selection is reproducible and tests are stable. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(xs: T[], rnd: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface SelectOptions {
  count: number;
  chapterIds?: string[];
  difficulty?: Difficulty;
  /** Order foundation → main → advanced, spreading the count across levels. */
  progressive?: boolean;
  exclude?: string[];
  seed?: number;
}

/** Pick questions. Only VERIFIED questions are eligible, so unverified/AI content never reaches scored practice. */
export function selectQuestions(bank: BankQuestion[], opts: SelectOptions): BankQuestion[] {
  const rnd = mulberry32(opts.seed ?? 1);
  const skip = new Set(opts.exclude ?? []);
  let pool = bank.filter((q) => q.verified && !skip.has(q.id));
  if (opts.chapterIds?.length) pool = pool.filter((q) => opts.chapterIds!.includes(q.chapterId));
  if (opts.difficulty) pool = pool.filter((q) => q.difficulty === opts.difficulty);

  if (!opts.progressive) return shuffle(pool, rnd).slice(0, opts.count);

  const byLevel = (['foundation', 'main', 'advanced'] as Difficulty[]).map((d) => shuffle(pool.filter((q) => q.difficulty === d), rnd));
  const picked: BankQuestion[] = [];
  let level = 0;
  while (picked.length < opts.count && byLevel.some((l) => l.length)) {
    const l = byLevel[level % 3];
    if (l.length) picked.push(l.shift()!);
    level++;
  }
  return picked.sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty]);
}

export interface Marking {
  correct: number;
  /** Negative or zero. */
  incorrect: number;
  /** Per-option partial marks for multi-correct; null = incomplete answers count as wrong. */
  partialPerCorrectOption: number | null;
}
export const DEFAULT_CUSTOM_MARKING: Marking = { correct: 4, incorrect: -1, partialPerCorrectOption: null };

const SUBJECT_NAME: Record<SubjectKey, string> = { math: 'Mathematics', physics: 'Physics', chemistry: 'Chemistry' };
const TYPE_NAME: Record<QuestionType, string> = {
  single: 'single correct', multi: 'one or more correct', integer: 'integer', matching: 'matching', assertion_reason: 'assertion–reason',
};

/**
 * Build a custom timed test from chosen questions. Marking is whatever the student sets
 * (clearly NOT an official pattern); integer answers carry no penalty.
 */
export function buildCustomExam(
  name: string,
  picked: BankQuestion[],
  keys: Record<string, AnswerKeyEntry>,
  marking: Marking,
  durationMinutes: number | null,
  negativeMarkingEnabled = true,
): { config: ExamConfig; questions: ExamQuestion[] } {
  const sections: ExamSection[] = [];
  const questions: ExamQuestion[] = [];

  for (const q of picked) {
    const sid = `${q.subject}-${q.type}`;
    let section = sections.find((s) => s.id === sid);
    if (!section) {
      section = {
        id: sid, name: `${SUBJECT_NAME[q.subject]} · ${TYPE_NAME[q.type]}`, subject: q.subject, questionType: q.type, questionCount: 0, attemptLimit: null,
        rule: {
          correct: marking.correct, unanswered: 0,
          incorrect: q.type === 'integer' ? 0 : marking.incorrect,
          partialPerCorrectOption: q.type === 'multi' ? marking.partialPerCorrectOption : null,
        },
      };
      sections.push(section);
    }
    section.questionCount++;
    const key = keys[q.id];
    if (!key) throw new Error(`No answer key for question ${q.id}`);
    questions.push({ id: q.id, sectionId: sid, topicId: q.topicId ?? q.chapterId, difficulty: q.difficulty, key });
  }
  questions.sort((a, b) => sections.findIndex((s) => s.id === a.sectionId) - sections.findIndex((s) => s.id === b.sectionId));
  return { config: { name, style: 'main', durationMinutes, negativeMarkingEnabled, sections }, questions };
}
