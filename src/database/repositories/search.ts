import { classifyProvenance } from '../../features/content/provenance';
import { Kind, likeTerm, parseQuery } from '../../features/search/query';
import { richToReadable } from '../../features/syllabus/math';
import type { SqlDb } from '../sqlite/types';

export interface SearchHit {
  kind: Kind; id: string; title: string; snippet: string | null;
  subject: string | null; chapterId: string | null; chapterTitle: string | null; topicId: string | null; topicTitle: string | null;
  score: number; verified: boolean;
}

const ESC = " ESCAPE '\\'";
const clip = (s: string | null, terms: string[]): string | null => {
  if (!s) return null;
  const plain = richToReadable(s).replace(/\s+/g, ' ');
  const i = Math.max(0, Math.min(...terms.map((t) => { const k = plain.toLowerCase().indexOf(t.replace(/s$/, '')); return k < 0 ? 1e9 : k; })));
  const start = i > 1e8 ? 0 : Math.max(0, i - 30);
  return (start > 0 ? '…' : '') + plain.slice(start, start + 140) + (plain.length > start + 140 ? '…' : '');
};

/**
 * Search the whole library on this device. Every term must appear (title matches rank above body matches).
 * Answer keys are never searched or returned. Unverified material is included and flagged.
 */
export const searchRepo = {
  async search(db: SqlDb, input: string, opts: { limit?: number; offset?: number } = {}): Promise<SearchHit[]> {
    const { terms, kinds } = parseQuery(input);
    const want = (k: Kind) => !kinds || kinds.includes(k);
    if (terms.length === 0 && !kinds) return [];
    const likes = terms.map(likeTerm);
    const matchAll = (cols: string[]) => likes.map(() => `(${cols.map((c) => `${c} LIKE ? ${ESC}`).join(' OR ')})`).join(' AND ') || '1=1';
    const bind = (cols: string[]) => likes.flatMap((l) => cols.map(() => l));
    const ctx = `c.id AS chapter_id, c.title AS chapter_title, s.key AS subject`;
    const join = `JOIN chapters c ON c.id = x.chapter_id JOIN subjects s ON s.id = c.subject_id LEFT JOIN topics t ON t.id = x.topic_id`;
    const live = `x.deleted_at IS NULL`;
    const hits: SearchHit[] = [];
    const score = (title: string) => (terms.length && terms.every((t) => title.toLowerCase().includes(t.replace(/s$/, ''))) ? 2 : 1);

    type R = { id: string; title: string; body: string | null; chapter_id: string; chapter_title: string; subject: string; topic_id: string | null; topic_title: string | null; vs: string | null; origin?: 'official' | 'coaching' | 'generated' | 'student'; ec?: string | null; ey?: number | null; cit?: string | null };
    const push = (kind: Kind, r: R, title: string, body: string | null, verifiedFlag?: boolean) => hits.push({
      kind, id: r.id, title, snippet: clip(body, terms), subject: r.subject, chapterId: r.chapter_id, chapterTitle: r.chapter_title, topicId: r.topic_id, topicTitle: r.topic_title,
      score: score(title) + (kind === 'topic' || kind === 'chapter' ? 1 : 0), verified: verifiedFlag ?? (r.vs === 'verified' || r.vs === 'published'),
    });

    if (want('chapter')) {
      for (const r of await db.all<{ id: string; title: string; subject: string }>(`SELECT x.id, x.title, s.key AS subject FROM chapters x JOIN subjects s ON s.id = x.subject_id WHERE ${live} AND ${matchAll(['x.title'])}`, bind(['x.title']))) {
        hits.push({ kind: 'chapter', id: r.id, title: r.title, snippet: null, subject: r.subject, chapterId: r.id, chapterTitle: r.title, topicId: null, topicTitle: null, score: 3, verified: true });
      }
    }
    if (want('topic')) {
      for (const r of await db.all<R>(`SELECT x.id, x.title, NULL AS body, ${ctx}, x.id AS topic_id, x.title AS topic_title, x.verification_status AS vs FROM topics x JOIN chapters c ON c.id = x.chapter_id JOIN subjects s ON s.id = c.subject_id WHERE ${live} AND ${matchAll(['x.title'])}`, bind(['x.title']))) push('topic', r, r.title, null);
    }
    if (want('lesson')) {
      for (const r of await db.all<R>(`SELECT x.id, x.section AS title, x.body, ${ctx}, x.topic_id, t.title AS topic_title, x.verification_status AS vs FROM learning_content x ${join} WHERE ${live} AND x.verification_status != 'archived' AND ${matchAll(['x.body'])} LIMIT 100`, bind(['x.body']))) push('lesson', r, `${(r.topic_title ?? r.chapter_title)} · ${r.title.replace(/_/g, ' ')}`, r.body);
    }
    if (want('formula')) {
      for (const r of await db.all<R>(`SELECT x.id, x.name AS title, COALESCE(x.explanation, x.latex) AS body, ${ctx}, x.topic_id, t.title AS topic_title, x.verification_status AS vs FROM formulas x ${join} WHERE ${live} AND ${matchAll(['x.name', 'x.explanation', 'x.latex'])} LIMIT 100`, bind(['x.name', 'x.explanation', 'x.latex']))) push('formula', r, r.title, r.body);
    }
    if (want('video')) {
      for (const r of await db.all<R>(`SELECT x.id, x.title, COALESCE(x.why, x.channel) AS body, ${ctx}, x.topic_id, t.title AS topic_title, x.verification_status AS vs FROM video_resources x ${join} WHERE ${live} AND ${matchAll(['x.title', 'x.channel', 'x.why', 'c.title', 't.title'])} LIMIT 100`, bind(['x.title', 'x.channel', 'x.why', 'c.title', 't.title']))) push('video', r, r.title, r.body);
    }
    if (want('note')) {
      for (const r of await db.all<R>(`SELECT x.id, COALESCE(x.title, 'Note') AS title, x.body, ${ctx}, x.topic_id, t.title AS topic_title, 'verified' AS vs FROM notes x ${join} WHERE ${live} AND ${matchAll(['x.body', 'x.title'])} LIMIT 100`, bind(['x.body', 'x.title']))) push('note', r, r.title, r.body, true);
    }
    if (want('question') || want('pyq')) {
      // Stems only. The answer key lives in another table and is never queried here. Chapter and topic names also match, so "functions PYQs" works.
      const qcols = ['x.stem', 'c.title', 't.title'];
      for (const r of await db.all<R>(`SELECT x.id, x.stem AS title, x.stem AS body, ${ctx}, x.topic_id, t.title AS topic_title, x.verification_status AS vs, x.origin, x.exam_category AS ec, x.exam_year AS ey, x.citation AS cit
          FROM questions x ${join} WHERE ${live} AND x.verification_status IN ('verified','published') AND ${matchAll(qcols)} LIMIT 200`, bind(qcols))) {
        const isPyq = classifyProvenance({ origin: r.origin!, examCategory: r.ec, examYear: r.ey, citation: r.cit }) === 'pyq';
        if (isPyq ? want('pyq') : want('question')) push(isPyq ? 'pyq' : 'question', r, richToReadable(r.title).slice(0, 90), null, true);
      }
    }
    if (want('mistake')) {
      const cols = ['x.question_text', 'x.student_note', 'x.working_steps'];
      for (const r of await db.all<R>(`SELECT x.id, x.question_text AS title, x.student_note AS body, ${ctx}, x.topic_id, t.title AS topic_title, 'verified' AS vs FROM mistake_entries x ${join} WHERE ${live} AND ${matchAll(cols)} LIMIT 100`, bind(cols))) push('mistake', r, richToReadable(r.title).slice(0, 90), r.body, true);
    }

    hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    const off = opts.offset ?? 0;
    return hits.slice(off, off + (opts.limit ?? 40));
  },
};
