import { addCounts, ChapterCoverage, CoverageItem, emptyCounts, ItemCounts, topicStatus, TopicCoverage } from '../../features/coverage/coverage';
import { classifyProvenance } from '../../features/content/provenance';
import type { SqlDb } from '../sqlite/types';

const isVerified = (s: string) => s === 'verified' || s === 'published';
interface Row { chapter_id: string; topic_id: string | null; verification_status: string; n: number }

/** Counts what exists, per chapter and topic. Chapter-level material (no topic) is reported on the chapter row. */
export const coverageRepo = {
  async load(db: SqlDb): Promise<ChapterCoverage[]> {
    const live = "deleted_at IS NULL AND verification_status != 'archived'";
    const group = (table: string, extra = '') =>
      db.all<Row>(`SELECT chapter_id, topic_id, verification_status, COUNT(*) n FROM ${table} WHERE ${live} ${extra} GROUP BY chapter_id, topic_id, verification_status`);
    const [chapters, topics, expl, examples, formulas, videos, notes] = await Promise.all([
      db.all<{ id: string; title: string; subject: string }>('SELECT c.id, c.title, s.key AS subject FROM chapters c JOIN subjects s ON s.id = c.subject_id WHERE c.deleted_at IS NULL ORDER BY s.sort_order, c.sort_order'),
      db.all<{ id: string; chapter_id: string; title: string }>('SELECT id, chapter_id, title FROM topics WHERE deleted_at IS NULL ORDER BY sort_order, title'),
      group('learning_content', "AND section IN ('introduction','why_it_matters','explanation','derivation')"),
      group('learning_content', "AND section = 'example'"),
      group('formulas'), group('video_resources'),
      // Notes carry no verification state of their own: personal notes are the student's, so they count as unverified.
      db.all<{ chapter_id: string; topic_id: string | null; n: number }>('SELECT chapter_id, topic_id, COUNT(*) n FROM notes WHERE deleted_at IS NULL AND chapter_id IS NOT NULL GROUP BY chapter_id, topic_id'),
    ]);
    const qs = await db.all<{ chapter_id: string; topic_id: string | null; origin: 'official' | 'coaching' | 'generated' | 'student'; exam_category: string | null; exam_year: number | null; citation: string | null; verification_status: string; n: number }>(
      `SELECT chapter_id, topic_id, origin, exam_category, exam_year, citation, verification_status, COUNT(*) n FROM questions WHERE ${live} GROUP BY chapter_id, topic_id, origin, exam_category, exam_year, citation, verification_status`);

    const bucket = new Map<string, ItemCounts>();
    const get = (c: string, t: string | null) => { const k = `${c}|${t ?? ''}`; let v = bucket.get(k); if (!v) { v = emptyCounts(); bucket.set(k, v); } return v; };
    const add = (rows: Row[], item: CoverageItem) => { for (const r of rows) get(r.chapter_id, r.topic_id)[item][isVerified(r.verification_status) ? 'verified' : 'unverified'] += r.n; };
    add(expl, 'explanation'); add(examples, 'examples'); add(formulas, 'formulas'); add(videos, 'videos');
    for (const r of notes) get(r.chapter_id, r.topic_id).notes.unverified += r.n;
    for (const q of qs) {
      const item: CoverageItem = classifyProvenance({ origin: q.origin, examCategory: q.exam_category, examYear: q.exam_year, citation: q.citation }) === 'pyq' ? 'pyq' : 'practice';
      get(q.chapter_id, q.topic_id)[item][isVerified(q.verification_status) ? 'verified' : 'unverified'] += q.n;
    }

    return chapters.map((c) => {
      const own = bucket.get(`${c.id}|`) ?? emptyCounts();
      const topicRows: TopicCoverage[] = topics.filter((t) => t.chapter_id === c.id).map((t) => {
        const counts = bucket.get(`${c.id}|${t.id}`) ?? emptyCounts();
        return { topicId: t.id, title: t.title, counts, status: topicStatus(counts) };
      });
      const total = topicRows.reduce((a, t) => addCounts(a, t.counts), own);
      return { chapterId: c.id, title: c.title, subject: c.subject, counts: total, status: topicStatus(total), topics: topicRows };
    });
  },
};
