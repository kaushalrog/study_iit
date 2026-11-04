import type { SqlDb, SqlValue } from '../sqlite/types';
import { newId } from '../../utils/ids';

const ident = /^[a-z_][a-z0-9_]*$/;

/** Tables whose rows are student-owned and replicated to Supabase. */
export const SYNCED_TABLES = [
  'profiles', 'exam_templates', 'exam_sections', 'scoring_rules', 'exams', 'topics', 'questions', 'question_solutions',
  'learning_content', 'formulas', 'exam_subject_results', 'question_attempts', 'mock_attempts', 'study_tasks', 'study_sessions',
  'mistake_entries', 'revision_schedule', 'topic_mastery', 'ai_conversations', 'ai_messages', 'notes', 'video_resources', 'content_reviews',
] as const;

/**
 * Write a row locally and queue it for upload in the same transaction.
 * The local write is the source of truth; success never depends on the network.
 */
export async function upsertRow(db: SqlDb, table: string, row: Record<string, SqlValue>): Promise<void> {
  if (!ident.test(table)) throw new Error(`bad table ${table}`);
  const cols = Object.keys(row);
  if (!cols.every((c) => ident.test(c))) throw new Error('bad column');
  if (!('id' in row)) throw new Error('row needs an id');
  const now = new Date().toISOString();
  const full: Record<string, SqlValue> = { ...row, updated_at: now };
  const names = Object.keys(full);
  const sql =
    `INSERT INTO ${table} (${names.join(',')}) VALUES (${names.map(() => '?').join(',')}) ` +
    `ON CONFLICT(id) DO UPDATE SET ${names.filter((c) => c !== 'id').map((c) => `${c}=excluded.${c}`).join(',')}`;
  await db.tx(async () => {
    await db.run(sql, names.map((n) => full[n]));
    if ((SYNCED_TABLES as readonly string[]).includes(table)) {
      const saved = await db.first<Record<string, unknown>>(`SELECT * FROM ${table} WHERE id = ?`, [row.id]);
      await db.run('DELETE FROM sync_outbox WHERE table_name = ? AND row_id = ?', [table, row.id]);
      await db.run(
        `INSERT OR REPLACE INTO sync_outbox (id, table_name, row_id, op, payload_json) VALUES (?, ?, ?, 'upsert', ?)`,
        [newId(), table, row.id, JSON.stringify(saved)],
      );
    }
  });
}

/** Patch an existing row and queue the full resulting row for upload. */
export async function updateRow(db: SqlDb, table: string, id: string, patch: Record<string, SqlValue>): Promise<void> {
  if (!ident.test(table)) throw new Error(`bad table ${table}`);
  const cols = Object.keys(patch);
  if (!cols.every((c) => ident.test(c))) throw new Error('bad column');
  const now = new Date().toISOString();
  await db.tx(async () => {
    await db.run(`UPDATE ${table} SET ${cols.map((c) => `${c}=?`).join(',')}, updated_at=? WHERE id=?`, [...cols.map((c) => patch[c]), now, id]);
    if ((SYNCED_TABLES as readonly string[]).includes(table)) {
      const saved = await db.first<Record<string, unknown>>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
      if (saved) {
        await db.run('DELETE FROM sync_outbox WHERE table_name = ? AND row_id = ?', [table, id]);
        await db.run(
          `INSERT OR REPLACE INTO sync_outbox (id, table_name, row_id, op, payload_json) VALUES (?, ?, ?, 'upsert', ?)`,
          [newId(), table, id, JSON.stringify(saved)],
        );
      }
    }
  });
}
