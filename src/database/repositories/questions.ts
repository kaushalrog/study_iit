import { z } from 'zod';
import type { BankQuestion, Difficulty } from '../../features/practice/quiz';
import type { AnswerKeyEntry, QuestionType, SubjectKey } from '../../features/exam-engine/types';
import { newId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { upsertRow } from './base';

export const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export const newQuestionSchema = z
  .object({
    chapterId: z.string().min(1, 'Choose a chapter.'),
    type: z.enum(['single', 'multi', 'integer', 'matching', 'assertion_reason']),
    stem: z.string().trim().min(5, 'Write the question.'),
    options: z.array(z.string().trim()).default([]),
    correct: z.array(z.string()).default([]),
    numeric: z.number().finite().nullable().default(null),
    tolerance: z.number().min(0).default(0),
    difficulty: z.enum(['foundation', 'main', 'advanced']).default('main'),
    origin: z.enum(['official', 'coaching', 'student']).default('coaching'),
    explanation: z.string().default(''),
    hint: z.string().default(''),
    sourceNote: z.string().default(''),
    /** The student confirms the answer key against a trusted source (book / teacher / answer key). */
    verified: z.boolean().default(false),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'integer') {
      if (q.numeric === null) ctx.addIssue({ code: 'custom', message: 'Enter the numerical answer.' });
      return;
    }
    const opts = q.options.filter((o) => o.length > 0);
    if (opts.length < 2) { ctx.addIssue({ code: 'custom', message: 'Add at least two options.' }); return; }
    const valid = new Set(OPTION_KEYS.slice(0, opts.length));
    const picked = Array.from(new Set(q.correct));
    if (picked.length === 0) ctx.addIssue({ code: 'custom', message: 'Mark the correct option.' });
    if (picked.some((c) => !valid.has(c as never))) ctx.addIssue({ code: 'custom', message: 'Correct answer must be one of the options.' });
    if (q.type !== 'multi' && picked.length > 1) ctx.addIssue({ code: 'custom', message: 'Only one option can be correct for this type.' });
  });
export type NewQuestion = z.input<typeof newQuestionSchema>;

export interface PracticeQuestion {
  id: string; chapterId: string; chapterTitle: string; subject: SubjectKey; type: QuestionType; stem: string;
  options: string[]; difficulty: Difficulty; origin: string; sourceNote: string | null; hasHint: boolean;
}

export const questionRepo = {
  async add(db: SqlDb, input: NewQuestion): Promise<string> {
    const v = newQuestionSchema.parse(input);
    const options = v.type === 'integer' ? [] : v.options.filter((o) => o.length > 0);
    const status = v.verified ? 'verified' : 'needs_review';
    const id = newId();
    await db.tx(async () => {
      await upsertRow(db, 'questions', {
        id, chapter_id: v.chapterId, type: v.type, stem: v.stem, options_json: JSON.stringify(options), difficulty: v.difficulty,
        origin: v.origin, verification_status: status, source_note: v.sourceNote || null,
      });
      const answer: AnswerKeyEntry = v.type === 'integer' ? { numeric: v.numeric!, tolerance: v.tolerance } : { correct: Array.from(new Set(v.correct)).sort() };
      await upsertRow(db, 'question_solutions', {
        id: newId(), question_id: id, answer_json: JSON.stringify(answer), explanation: v.explanation || null, hint: v.hint || null, verification_status: status,
      });
    });
    return id;
  },

  /** Question lists never include answers; keys come only from `keys()` / `solution()`. */
  async list(db: SqlDb, opts: { verifiedOnly?: boolean; chapterId?: string } = {}): Promise<PracticeQuestion[]> {
    const where = ['q.deleted_at IS NULL'];
    const params: string[] = [];
    if (opts.verifiedOnly !== false) where.push("q.verification_status IN ('verified','published')");
    if (opts.chapterId) { where.push('q.chapter_id = ?'); params.push(opts.chapterId); }
    const rows = await db.all<{
      id: string; chapter_id: string; title: string; subject: SubjectKey; type: QuestionType; stem: string; options_json: string | null;
      difficulty: Difficulty; origin: string; source_note: string | null; hint: string | null;
    }>(`SELECT q.id, q.chapter_id, c.title, s.key AS subject, q.type, q.stem, q.options_json, q.difficulty, q.origin, q.source_note,
          (SELECT hint FROM question_solutions qs WHERE qs.question_id = q.id) AS hint
        FROM questions q JOIN chapters c ON c.id = q.chapter_id JOIN subjects s ON s.id = c.subject_id
        WHERE ${where.join(' AND ')} ORDER BY c.sort_order, q.created_at`, params);
    return rows.map((r) => ({
      id: r.id, chapterId: r.chapter_id, chapterTitle: r.title, subject: r.subject, type: r.type, stem: r.stem,
      options: r.options_json ? JSON.parse(r.options_json) : [], difficulty: r.difficulty, origin: r.origin, sourceNote: r.source_note, hasHint: !!r.hint,
    }));
  },

  toBank(qs: PracticeQuestion[]): BankQuestion[] {
    return qs.map((q) => ({ id: q.id, chapterId: q.chapterId, subject: q.subject, type: q.type, difficulty: q.difficulty, verified: true }));
  },

  async keys(db: SqlDb, ids: string[]): Promise<Record<string, AnswerKeyEntry>> {
    const out: Record<string, AnswerKeyEntry> = {};
    for (const id of ids) {
      const r = await db.first<{ answer_json: string }>('SELECT answer_json FROM question_solutions WHERE question_id = ?', [id]);
      if (r) out[id] = JSON.parse(r.answer_json);
    }
    return out;
  },

  /** Revealed only after the student has answered. */
  async solution(db: SqlDb, id: string) {
    const r = await db.first<{ answer_json: string; explanation: string | null; hint: string | null }>(
      'SELECT answer_json, explanation, hint FROM question_solutions WHERE question_id = ?', [id]);
    return r ? { key: JSON.parse(r.answer_json) as AnswerKeyEntry, explanation: r.explanation ?? '', hint: r.hint ?? '' } : null;
  },

  async hint(db: SqlDb, id: string): Promise<string> {
    return (await db.first<{ hint: string | null }>('SELECT hint FROM question_solutions WHERE question_id = ?', [id]))?.hint ?? '';
  },

  async unverifiedCount(db: SqlDb): Promise<number> {
    return (await db.first<{ n: number }>("SELECT COUNT(*) AS n FROM questions WHERE verification_status NOT IN ('verified','published') AND deleted_at IS NULL"))!.n;
  },
};
