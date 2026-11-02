import { newId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { upsertRow } from './base';

export const notesRepo = {
  list(db: SqlDb, chapterId: string) {
    return db.all<{ id: string; title: string | null; body: string; source: string; created_at: string }>(
      'SELECT id, title, body, source, created_at FROM notes WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY created_at DESC', [chapterId]);
  },
  async add(db: SqlDb, chapterId: string, body: string, opts: { title?: string; source?: 'student' | 'ai_tutor' } = {}): Promise<string> {
    const text = body.trim();
    if (!text) throw new Error('Write something first.');
    const id = newId();
    await upsertRow(db, 'notes', { id, chapter_id: chapterId, title: opts.title ?? null, body: text, source: opts.source ?? 'student' });
    return id;
  },
};
