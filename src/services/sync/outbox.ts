import type { SqlDb } from '../../database/sqlite/types';

export interface OutboxRow { id: string; table_name: string; row_id: string; op: 'upsert' | 'delete'; payload_json: string; attempts: number }

/** Subset of the Supabase client the pusher needs, so it can be tested with a fake. */
export interface RemoteWriter {
  upsert(table: string, row: Record<string, unknown>): Promise<{ error: { message: string } | null }>;
}

export const MAX_ATTEMPTS = 8;
export const backoffMs = (attempts: number) => Math.min(15 * 60_000, 2_000 * 2 ** attempts);

/** Parents before children, so foreign keys are satisfied on the server. Also the pull order. */
export const SYNC_ORDER = [
  'profiles', 'exam_templates', 'exam_sections', 'scoring_rules', 'exams', 'topics', 'learning_content', 'formulas', 'questions', 'question_solutions',
  'exam_subject_results', 'question_attempts', 'mock_attempts', 'study_tasks', 'study_sessions',
  'mistake_entries', 'revision_schedule', 'topic_mastery', 'ai_conversations', 'ai_messages', 'notes', 'video_resources', 'content_reviews',
] as const;

/** Server tables that have no owner_id column (their access is derived from the parent template). */
export const NO_OWNER = new Set<string>(['exam_sections', 'scoring_rules']);

/** SQLite `*_json` text column <-> Postgres jsonb column. */
export const JSON_ALIAS: Record<string, string> = {
  selected_json: 'selected', syllabus_json: 'syllabus', options_json: 'options', generation_json: 'generation', meta_json: 'meta',
  answer_json: 'answer', config_json: 'config', result_json: 'result', variables_json: 'variables', checks_json: 'checks',
};
/** 0/1 in SQLite, boolean in Postgres. */
export const BOOL_COLS = new Set(['hint_used', 'marked_for_review', 'ocr_confirmed', 'review_concept', 'saved_to_notes', 'negative_marking_enabled', 'external', 'saved']);
/** Columns that exist only on the device (files are not uploaded yet; recovery state is private). */
export const LOCAL_ONLY_COLS = ['image_uri', 'session_state_json'];

export function toRemoteRow(table: string, local: Record<string, unknown>, ownerId: string): Record<string, unknown> {
  const out: Record<string, unknown> = { ...local };
  if (NO_OWNER.has(table)) delete out.owner_id; else out.owner_id = ownerId;
  for (const [from, to] of Object.entries(JSON_ALIAS)) {
    if (from in out) { out[to] = out[from] ? JSON.parse(out[from] as string) : null; delete out[from]; }
  }
  for (const c of LOCAL_ONLY_COLS) delete out[c];
  for (const b of BOOL_COLS) if (b in out) out[b] = !!out[b];
  return out;
}

/**
 * Push pending rows. Upserts are keyed by the device-generated primary key, so a retry
 * (or the same row arriving from two devices) can never create a duplicate.
 * Returns counts so the UI can show an honest "last synced" state.
 */
export async function pushOutbox(db: SqlDb, remote: RemoteWriter, ownerId: string, now = Date.now()): Promise<{ pushed: number; failed: number; pending: number }> {
  const due = await db.all<OutboxRow>(
    `SELECT * FROM sync_outbox WHERE attempts < ? AND (next_attempt_at IS NULL OR next_attempt_at <= ?) ORDER BY created_at LIMIT 500`,
    [MAX_ATTEMPTS, new Date(now).toISOString()]);
  const rank = (t: string) => { const i = (SYNC_ORDER as readonly string[]).indexOf(t); return i < 0 ? 99 : i; };
  const rows = [...due].sort((a, b) => rank(a.table_name) - rank(b.table_name)).slice(0, 100);
  let pushed = 0, failed = 0;
  for (const r of rows) {
    const { error } = await remote.upsert(r.table_name, toRemoteRow(r.table_name, JSON.parse(r.payload_json), ownerId));
    if (!error) {
      await db.run('DELETE FROM sync_outbox WHERE id = ?', [r.id]);
      pushed++;
    } else {
      failed++;
      await db.run('UPDATE sync_outbox SET attempts = attempts + 1, last_error = ?, next_attempt_at = ? WHERE id = ?',
        [error.message, new Date(now + backoffMs(r.attempts)).toISOString(), r.id]);
    }
  }
  const left = await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM sync_outbox');
  if (pushed > 0) await db.run("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('last_synced_at', ?)", [new Date(now).toISOString()]);
  return { pushed, failed, pending: left?.n ?? 0 };
}
