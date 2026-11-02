import type { SqlDb } from '../sqlite/types';
import type { SubjectKey } from '../../features/exam-engine/types';

export type TopicStatus = 'not_started' | 'learning' | 'learning_completed' | 'practising' | 'needs_revision' | 'mastered';

export interface ChapterRow {
  id: string;
  title: string;
  subject: SubjectKey;
  subjectName: string;
  topicCount: number;
  lessonCount: number;
  formulaCount: number;
  questionCount: number;
  verification: string;
}

export const syllabusRepo = {
  async chapters(db: SqlDb): Promise<ChapterRow[]> {
    const rows = await db.all<{
      id: string; title: string; subject: SubjectKey; subject_name: string; verification_status: string;
      topics: number; lessons: number; formulas: number; questions: number;
    }>(`
      SELECT c.id, c.title, s.key AS subject, s.name AS subject_name, c.verification_status,
        (SELECT COUNT(*) FROM topics t WHERE t.chapter_id = c.id AND t.deleted_at IS NULL) AS topics,
        (SELECT COUNT(*) FROM learning_content l WHERE l.chapter_id = c.id AND l.verification_status IN ('verified','published') AND l.deleted_at IS NULL) AS lessons,
        (SELECT COUNT(*) FROM formulas f WHERE f.chapter_id = c.id AND f.verification_status IN ('verified','published') AND f.deleted_at IS NULL) AS formulas,
        (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = c.id AND q.verification_status IN ('verified','published') AND q.deleted_at IS NULL) AS questions
      FROM chapters c JOIN subjects s ON s.id = c.subject_id
      WHERE c.deleted_at IS NULL
      ORDER BY s.sort_order, c.sort_order`);
    return rows.map((r) => ({
      id: r.id, title: r.title, subject: r.subject, subjectName: r.subject_name, verification: r.verification_status,
      topicCount: r.topics, lessonCount: r.lessons, formulaCount: r.formulas, questionCount: r.questions,
    }));
  },

  async chapter(db: SqlDb, id: string): Promise<ChapterRow | null> {
    return (await this.chapters(db)).find((c) => c.id === id) ?? null;
  },

  topics(db: SqlDb, chapterId: string) {
    return db.all<{ id: string; title: string; status: TopicStatus; verification_status: string }>(
      'SELECT id, title, status, verification_status FROM topics WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY sort_order', [chapterId]);
  },

  lessons(db: SqlDb, chapterId: string, language: 'en' | 'te') {
    return db.all<{ id: string; section: string; body: string; level: string; verification_status: string }>(
      `SELECT id, section, body, level, verification_status FROM learning_content
       WHERE chapter_id = ? AND language = ? AND verification_status IN ('verified','published') AND deleted_at IS NULL ORDER BY sort_order`,
      [chapterId, language]);
  },

  formulas(db: SqlDb, chapterId: string) {
    return db.all<{ id: string; name: string; latex: string; variables_json: string; units: string | null; conditions: string | null; verification_status: string }>(
      `SELECT id, name, latex, variables_json, units, conditions, verification_status FROM formulas
       WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY name`, [chapterId]);
  },

  async setTopicStatus(db: SqlDb, topicId: string, status: TopicStatus): Promise<void> {
    // Mastery must come from assessment evidence, never from a manual tap or from opening a lesson.
    if (status === 'mastered') throw new Error('Mastered can only be derived from assessment evidence.');
    await db.run('UPDATE topics SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), topicId]);
  },
};
