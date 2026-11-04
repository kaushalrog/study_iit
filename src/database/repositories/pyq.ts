import { classifyProvenance, EXAM_LABEL } from '../../features/content/provenance';
import type { SqlDb } from '../sqlite/types';

export interface PyqRow { id: string; stem: string; examLabel: string; year: number; session: string | null; citation: string; citationUrl: string | null; difficulty: string }

/** Previous-year questions are only those that pass the provenance rule; verified ones only. */
export const pyqRepo = {
  async list(db: SqlDb, chapterId: string, topicId: string | null): Promise<PyqRow[]> {
    const rows = await db.all<{ id: string; stem: string; origin: 'official' | 'coaching' | 'generated' | 'student'; exam_category: string | null; exam_year: number | null; exam_session: string | null; citation: string | null; citation_url: string | null; difficulty: string }>(
      `SELECT id, stem, origin, exam_category, exam_year, exam_session, citation, citation_url, difficulty FROM questions
       WHERE chapter_id = ? AND (? IS NULL OR topic_id = ? OR topic_id IS NULL) AND origin = 'official' AND deleted_at IS NULL AND verification_status IN ('verified','published')
       ORDER BY exam_year DESC, created_at`, [chapterId, topicId, topicId]);
    return rows.filter((r) => classifyProvenance({ origin: r.origin, examCategory: r.exam_category, examYear: r.exam_year, citation: r.citation }) === 'pyq')
      .map((r) => ({ id: r.id, stem: r.stem, examLabel: EXAM_LABEL[r.exam_category!] ?? r.exam_category!, year: r.exam_year!, session: r.exam_session, citation: r.citation!, citationUrl: r.citation_url, difficulty: r.difficulty }));
  },
  /** Verified practice questions (not PYQs) for the chapter, and how many of them are tagged to the topic. */
  async practiceCounts(db: SqlDb, chapterId: string, topicId: string | null): Promise<{ chapter: number; topic: number }> {
    const r = await db.all<{ topic_id: string | null; origin: 'official' | 'coaching' | 'generated' | 'student'; exam_category: string | null; exam_year: number | null; citation: string | null; n: number }>(
      `SELECT topic_id, origin, exam_category, exam_year, citation, COUNT(*) n FROM questions WHERE chapter_id = ? AND deleted_at IS NULL AND verification_status IN ('verified','published')
       GROUP BY topic_id, origin, exam_category, exam_year, citation`, [chapterId]);
    let chapter = 0, topic = 0;
    for (const x of r) {
      if (classifyProvenance({ origin: x.origin, examCategory: x.exam_category, examYear: x.exam_year, citation: x.citation }) === 'pyq') continue;
      chapter += x.n; if (topicId && x.topic_id === topicId) topic += x.n;
    }
    return { chapter, topic };
  },
};
