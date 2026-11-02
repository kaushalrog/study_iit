import type { MasteryAttempt } from '../../features/analytics/mastery';
import type { Outcome } from '../../features/exam-engine/types';
import { newId, seedId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { upsertRow } from './base';

export interface NewAttempt {
  /** Client-generated; replaying the same id is a no-op, so retries never duplicate. */
  id?: string;
  questionId: string;
  examId?: string | null;
  kind: 'concept_check' | 'practice' | 'revision' | 'exam';
  selected?: string[];
  numeric?: number | null;
  outcome: Outcome;
  marks: number;
  timeMs: number;
  hintUsed?: boolean;
  markedForReview?: boolean;
  at?: Date;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Stable, valid-UUID id for "question X within session Y", so finishing a session twice can never duplicate an attempt. */
export const attemptIdFor = (sessionId: string, questionId: string): string => seedId(`attempt:${sessionId}:${questionId}`);

export const attemptRepo = {
  async record(db: SqlDb, a: NewAttempt): Promise<string> {
    const id = a.id ?? newId();
    const exists = await db.first('SELECT 1 AS x FROM question_attempts WHERE id = ?', [id]);
    if (exists) return id; // idempotent
    await upsertRow(db, 'question_attempts', {
      id, question_id: a.questionId, exam_id: a.examId ?? null, kind: a.kind,
      selected_json: a.selected ? JSON.stringify(a.selected) : null, numeric_answer: a.numeric ?? null,
      outcome: a.outcome, marks: a.marks, time_ms: a.timeMs, hint_used: a.hintUsed ? 1 : 0,
      marked_for_review: a.markedForReview ? 1 : 0, attempted_at: (a.at ?? new Date()).toISOString(),
    });
    return id;
  },

  /** Evidence for the mastery model. Only verified/published questions are returned as verified. */
  async masteryAttempts(db: SqlDb, chapterId: string): Promise<MasteryAttempt[]> {
    const rows = await db.all<{ outcome: Outcome; difficulty: MasteryAttempt['difficulty']; kind: string; hint_used: number; vs: string; at: string }>(
      `SELECT a.outcome, q.difficulty, a.kind, a.hint_used, q.verification_status AS vs, a.attempted_at AS at
       FROM question_attempts a JOIN questions q ON q.id = a.question_id
       WHERE q.chapter_id = ? AND a.deleted_at IS NULL AND a.outcome != 'unanswered'`, [chapterId]);
    return rows.map((r) => ({
      correct: r.outcome === 'correct',
      difficulty: r.difficulty,
      kind: r.kind === 'concept_check' ? 'concept_check' : r.kind === 'revision' ? 'revision' : 'practice',
      hintUsed: !!r.hint_used,
      verified: r.vs === 'verified' || r.vs === 'published',
      at: Date.parse(r.at),
    }));
  },

  async countSince(db: SqlDb, sinceIso: string): Promise<number> {
    const r = await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM question_attempts WHERE attempted_at >= ? AND deleted_at IS NULL', [sinceIso]);
    return r?.n ?? 0;
  },
};
