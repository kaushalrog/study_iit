import { z } from 'zod';
import { initialRevision, recordRevision, RevisionQuality } from '../../features/error-book/revision';
import { DateKey } from '../../utils/dates';
import { newId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { updateRow, upsertRow } from './base';

export const MISTAKE_CATEGORIES = [
  'conceptual', 'approach', 'calculation', 'formula_misuse', 'careless', 'time_management', 'misread',
] as const;
export type MistakeCategory = (typeof MISTAKE_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<MistakeCategory, string> = {
  conceptual: 'Conceptual misunderstanding',
  approach: 'Incorrect problem-solving approach',
  calculation: 'Calculation mistake',
  formula_misuse: 'Formula misapplication',
  careless: 'Careless mistake',
  time_management: 'Time-management error',
  misread: 'Misinterpreted question',
};

export const newMistakeSchema = z.object({
  subject: z.enum(['math', 'physics', 'chemistry']),
  chapterId: z.string().min(1).nullable(),
  topicId: z.string().nullable().default(null),
  questionId: z.string().nullable().default(null),
  questionText: z.string().trim().min(3, 'Write or scan the question.'),
  imageUri: z.string().nullable().default(null),
  myAnswer: z.string().default(''),
  correctAnswer: z.string().default(''),
  officialExplanation: z.string().default(''),
  workingSteps: z.string().default(''),
  studentNote: z.string().default(''),
  category: z.enum(MISTAKE_CATEGORIES),
  /** False means OCR text has not been confirmed by the student yet. */
  ocrConfirmed: z.boolean().default(true),
});
export type NewMistake = z.input<typeof newMistakeSchema>;

export interface MistakeRow {
  id: string; subject: string; chapterId: string | null; chapterTitle: string | null; questionText: string;
  category: MistakeCategory; correctAnswer: string; officialExplanation: string; workingSteps: string; studentNote: string;
  dueOn: string | null; stage: number | null; reviewConcept: boolean; consecutiveWrong: number; createdAt: string;
}

const SELECT = `
  SELECT m.id, m.subject_key AS subject, m.chapter_id AS chapterId, c.title AS chapterTitle, m.question_text AS questionText,
         m.category, COALESCE(m.correct_answer,'') AS correctAnswer, COALESCE(m.official_explanation,'') AS officialExplanation,
         COALESCE(m.working_steps,'') AS workingSteps, COALESCE(m.student_note,'') AS studentNote,
         r.due_on AS dueOn, r.stage, r.review_concept AS reviewConcept, COALESCE(r.consecutive_wrong,0) AS consecutiveWrong, m.created_at AS createdAt
  FROM mistake_entries m
  LEFT JOIN chapters c ON c.id = m.chapter_id
  LEFT JOIN revision_schedule r ON r.mistake_id = m.id
  WHERE m.deleted_at IS NULL`;

const hydrate = (r: Record<string, unknown>): MistakeRow => ({ ...(r as unknown as MistakeRow), reviewConcept: !!r.reviewConcept });

export const mistakeRepo = {
  /** Saves the mistake and its first revision date atomically, entirely offline. */
  async add(db: SqlDb, input: NewMistake, today: DateKey): Promise<string> {
    const v = newMistakeSchema.parse(input);
    if (!v.ocrConfirmed) throw new Error('Confirm the extracted question text before saving.');
    const id = newId();
    const rev = initialRevision(today);
    await db.tx(async () => {
      await upsertRow(db, 'mistake_entries', {
        id, subject_key: v.subject, chapter_id: v.chapterId, topic_id: v.topicId, question_id: v.questionId, question_text: v.questionText, image_uri: v.imageUri,
        my_answer: v.myAnswer, correct_answer: v.correctAnswer, official_explanation: v.officialExplanation,
        working_steps: v.workingSteps, student_note: v.studentNote, category: v.category, ocr_confirmed: 1,
      });
      await upsertRow(db, 'revision_schedule', {
        id: newId(), mistake_id: id, stage: rev.stage, interval_days: rev.intervalDays, consecutive_wrong: 0, due_on: rev.dueOn, review_concept: 0,
      });
    });
    return id;
  },

  async list(db: SqlDb, opts: { subject?: string; chapterId?: string; category?: MistakeCategory; search?: string } = {}): Promise<MistakeRow[]> {
    const where: string[] = [];
    const params: string[] = [];
    if (opts.subject) { where.push('m.subject_key = ?'); params.push(opts.subject); }
    if (opts.chapterId) { where.push('m.chapter_id = ?'); params.push(opts.chapterId); }
    if (opts.category) { where.push('m.category = ?'); params.push(opts.category); }
    if (opts.search?.trim()) {
      where.push("(m.question_text LIKE ? ESCAPE '\\' OR m.student_note LIKE ? ESCAPE '\\' OR m.official_explanation LIKE ? ESCAPE '\\')");
      const like = `%${opts.search.trim().replace(/[\\%_]/g, (c) => '\\' + c)}%`;
      params.push(like, like, like);
    }
    const rows = await db.all(`${SELECT} ${where.length ? 'AND ' + where.join(' AND ') : ''} ORDER BY m.created_at DESC`, params);
    return rows.map(hydrate);
  },

  async due(db: SqlDb, today: DateKey): Promise<MistakeRow[]> {
    const rows = await db.all(`${SELECT} AND r.due_on <= ? ORDER BY r.due_on, m.created_at`, [today]);
    return rows.map(hydrate);
  },

  async overdueCount(db: SqlDb, today: DateKey): Promise<number> {
    const r = await db.first<{ n: number }>(
      `SELECT COUNT(*) AS n FROM revision_schedule r JOIN mistake_entries m ON m.id = r.mistake_id
       WHERE r.due_on < ? AND r.deleted_at IS NULL AND m.deleted_at IS NULL`, [today]);
    return r?.n ?? 0;
  },

  async review(db: SqlDb, mistakeId: string, quality: RevisionQuality, today: DateKey): Promise<ReturnType<typeof recordRevision>> {
    const row = await db.first<{ id: string; stage: number; interval_days: number; consecutive_wrong: number; due_on: string }>(
      'SELECT id, stage, interval_days, consecutive_wrong, due_on FROM revision_schedule WHERE mistake_id = ?', [mistakeId]);
    if (!row) throw new Error('No revision schedule for this mistake');
    const next = recordRevision(
      { stage: row.stage, intervalDays: row.interval_days, consecutiveWrong: row.consecutive_wrong, dueOn: row.due_on }, quality, today);
    await updateRow(db, 'revision_schedule', row.id, {
      stage: next.stage, interval_days: next.intervalDays, consecutive_wrong: next.consecutiveWrong, due_on: next.dueOn,
      last_reviewed_at: new Date().toISOString(), review_concept: next.reviewConcept ? 1 : 0,
    });
    return next;
  },

  /** "Which mistake type is most common?" — computed from stored records. */
  categoryCounts(db: SqlDb, subject?: string) {
    return db.all<{ category: MistakeCategory; n: number }>(
      `SELECT category, COUNT(*) AS n FROM mistake_entries WHERE deleted_at IS NULL ${subject ? 'AND subject_key = ?' : ''}
       GROUP BY category ORDER BY n DESC`, subject ? [subject] : []);
  },
};
