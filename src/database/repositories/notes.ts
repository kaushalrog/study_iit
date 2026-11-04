import { newId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { upsertRow } from './base';

export const notesRepo = {
  list(db: SqlDb, chapterId: string) {
    return db.all<{ id: string; title: string | null; body: string; source: string; created_at: string }>(
      'SELECT id, title, body, source, created_at FROM notes WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY created_at DESC', [chapterId]);
  },
  /** Notes for one topic; with no topic, the chapter-level notes. */
  forTopic(db: SqlDb, chapterId: string, topicId: string | null) {
    return db.all<{ id: string; title: string | null; body: string; source: string; created_at: string }>(
      `SELECT id, title, body, source, created_at FROM notes WHERE chapter_id = ? AND deleted_at IS NULL AND ${topicId ? 'topic_id = ?' : 'topic_id IS NULL'} ORDER BY created_at DESC`, topicId ? [chapterId, topicId] : [chapterId]);
  },
  async add(db: SqlDb, chapterId: string, body: string, opts: { title?: string; source?: 'student' | 'ai_tutor'; topicId?: string | null } = {}): Promise<string> {
    const text = body.trim();
    if (!text) throw new Error('Write something first.');
    const id = newId();
    await upsertRow(db, 'notes', { id, chapter_id: chapterId, topic_id: opts.topicId ?? null, title: opts.title ?? null, body: text, source: opts.source ?? 'student' });
    return id;
  },
};
