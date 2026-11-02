import type { ExamConfig, ExamQuestion, ExamResult } from '../../features/exam-engine/types';
import type { SessionState } from '../../features/exam-engine/session';
import { newId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { upsertRow } from './base';

export interface ActiveSession {
  id: string;
  name: string;
  mode: 'timed' | 'practice';
  config: ExamConfig;
  questions: ExamQuestion[];
  session: SessionState;
  /** Practice mode: questions the student has checked (answers locked, feedback shown). */
  checked?: string[];
  hintUsed?: string[];
}

const KEY = 'active_session';

export const mockRepo = {
  /** Persist the in-progress session after every action so a crash loses nothing. */
  saveActive: (db: SqlDb, a: ActiveSession) =>
    db.run('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)', [KEY, JSON.stringify(a)]),
  async loadActive(db: SqlDb): Promise<ActiveSession | null> {
    const r = await db.first<{ value: string }>('SELECT value FROM app_meta WHERE key = ?', [KEY]);
    if (!r) return null;
    try { return JSON.parse(r.value) as ActiveSession; } catch { return null; }
  },
  clearActive: (db: SqlDb) => db.run('DELETE FROM app_meta WHERE key = ?', [KEY]),

  /** Save a finished attempt once; the id is the session id so a replay can't duplicate it. */
  async saveResult(db: SqlDb, a: { id: string; name: string; config: ExamConfig; startedAt: number; finishedAt: number; result: ExamResult }): Promise<string> {
    const exists = await db.first('SELECT 1 AS x FROM mock_attempts WHERE id = ?', [a.id]);
    if (exists) return a.id;
    const r = a.result;
    await upsertRow(db, 'mock_attempts', {
      id: a.id, name: a.name, config_json: JSON.stringify(a.config), started_at: new Date(a.startedAt).toISOString(),
      finished_at: new Date(a.finishedAt).toISOString(), total_marks: r.totalMarks, max_marks: r.maxMarks, percentage: r.percentage,
      accuracy: r.accuracy, attempt_rate: r.attemptRate, negative_lost: r.negativeLost, duration_ms: a.finishedAt - a.startedAt,
      result_json: JSON.stringify(r),
    });
    return a.id;
  },

  history(db: SqlDb) {
    return db.all<{ id: string; name: string; finished_at: string; total_marks: number; max_marks: number; percentage: number; accuracy: number; attempt_rate: number; negative_lost: number }>(
      'SELECT id, name, finished_at, total_marks, max_marks, percentage, accuracy, attempt_rate, negative_lost FROM mock_attempts WHERE deleted_at IS NULL ORDER BY finished_at DESC');
  },
  newId,
};
