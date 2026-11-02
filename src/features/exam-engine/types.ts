import { z } from 'zod';

export const QUESTION_TYPES = ['single', 'multi', 'integer', 'matching', 'assertion_reason'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const SUBJECT_KEYS = ['math', 'physics', 'chemistry'] as const;
export type SubjectKey = (typeof SUBJECT_KEYS)[number];

/**
 * Marking rule for one section. All numbers are signed marks as printed on the paper:
 * `incorrect` is typically negative (e.g. -1) or 0.
 */
export const scoringRuleSchema = z.object({
  correct: z.number().min(0),
  incorrect: z.number().max(0),
  unanswered: z.number().default(0),
  /**
   * Multi-correct partial marking. When set, a response containing only correct options
   * (but not all of them) earns `perCorrectOption` marks per selected option.
   * When null, an incomplete multi-correct response is treated as incorrect.
   */
  partialPerCorrectOption: z.number().min(0).nullable().default(null),
});
export type ScoringRule = z.infer<typeof scoringRuleSchema>;

export const examSectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  subject: z.enum(SUBJECT_KEYS),
  questionType: z.enum(QUESTION_TYPES),
  questionCount: z.number().int().positive(),
  /** Number of questions the student must attempt (optional-question rules). null = all. */
  attemptLimit: z.number().int().positive().nullable().default(null),
  rule: scoringRuleSchema,
});
export type ExamSection = z.infer<typeof examSectionSchema>;

export const examConfigSchema = z
  .object({
    name: z.string().min(1),
    style: z.enum(['main', 'advanced']),
    durationMinutes: z.number().int().positive().nullable(),
    negativeMarkingEnabled: z.boolean(),
    sections: z.array(examSectionSchema),
  })
  .refine((c) => new Set(c.sections.map((s) => s.id)).size === c.sections.length, {
    message: 'Section ids must be unique',
  });
export type ExamConfig = z.infer<typeof examConfigSchema>;

/** A student's response to one question. */
export interface Response {
  /** Option keys for single/multi/matching/assertion_reason, e.g. ['A','C'] */
  selected?: string[];
  /** Integer/numerical answers */
  numeric?: number | null;
}

export interface AnswerKeyEntry {
  /** Correct option keys (non-numeric types) */
  correct?: string[];
  /** Correct numerical answer (integer type) */
  numeric?: number;
  /** Absolute tolerance for numerical answers. Defaults to 0 (exact). */
  tolerance?: number;
}

export interface ExamQuestion {
  id: string;
  sectionId: string;
  topicId?: string | null;
  difficulty?: 'foundation' | 'main' | 'advanced';
  key: AnswerKeyEntry;
}

export type Outcome = 'correct' | 'partial' | 'incorrect' | 'unanswered';

export interface QuestionResult {
  questionId: string;
  sectionId: string;
  subject: SubjectKey;
  topicId?: string | null;
  outcome: Outcome;
  marks: number;
  maxMarks: number;
  /** Positive number of marks lost to negative marking on this question */
  negativeLost: number;
  timeMs: number;
}

export interface SubjectSummary {
  subject: SubjectKey;
  marks: number;
  maxMarks: number;
  correct: number;
  partial: number;
  incorrect: number;
  unanswered: number;
  negativeLost: number;
}

export interface ExamResult {
  questions: QuestionResult[];
  subjects: SubjectSummary[];
  totalMarks: number;
  maxMarks: number;
  /** marks / maxMarks * 100 — NOT accuracy */
  percentage: number;
  /** fully-correct / attempted * 100 — NOT percentage of marks */
  accuracy: number;
  /** attempted / total questions * 100 */
  attemptRate: number;
  correct: number;
  partial: number;
  incorrect: number;
  unanswered: number;
  negativeLost: number;
  totalTimeMs: number;
  avgTimePerAttemptedMs: number;
}
