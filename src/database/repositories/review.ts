import { richToReadable } from '../../features/syllabus/math';
import type { SqlDb } from '../sqlite/types';
import { updateRow } from './base';
import { reviewsRepo } from './reviews';

export type ReviewKind = 'lesson' | 'formula' | 'question' | 'video';
export interface ReviewItem { kind: ReviewKind; id: string; title: string; detail: string; topic: string | null; meta: string }

const pending = (a: string) => `${a}.verification_status IN ('draft','extracted','needs_review') AND ${a}.deleted_at IS NULL`;
const TABLE: Record<ReviewKind, string> = { lesson: 'learning_content', formula: 'formulas', question: 'questions', video: 'video_resources' };

/** Material waiting for a person to check it. Confirming is the student's (or teacher's) statement, never an automatic step. */
export const reviewRepo = {
  async counts(db: SqlDb, chapterId: string): Promise<Record<ReviewKind, number>> {
    const out = {} as Record<ReviewKind, number>;
    for (const k of Object.keys(TABLE) as ReviewKind[]) out[k] = (await db.first<{ n: number }>(`SELECT COUNT(*) n FROM ${TABLE[k]} x WHERE x.chapter_id = ? AND ${pending('x')}`, [chapterId]))!.n;
    return out;
  },

  async list(db: SqlDb, chapterId: string, kind: ReviewKind, limit = 20, offset = 0, scope: 'pending' | 'all' = 'pending'): Promise<ReviewItem[]> {
    const where = (a: string) => (scope === 'pending' ? pending(a) : `${a}.deleted_at IS NULL`);
    const topic = 'COALESCE((SELECT title FROM topics t WHERE t.id = x.topic_id), NULL)';
    if (kind === 'lesson') {
      return (await db.all<{ id: string; section: string; level: string; body: string; topic: string | null }>(
        `SELECT x.id, x.section, x.level, x.body, ${topic} AS topic FROM learning_content x WHERE x.chapter_id = ? AND ${where('x')} ORDER BY x.sort_order, x.created_at LIMIT ? OFFSET ?`, [chapterId, limit, offset]))
        .map((r) => ({ kind, id: r.id, title: r.section.replace(/_/g, ' '), detail: richToReadable(r.body), topic: r.topic, meta: r.level }));
    }
    if (kind === 'formula') {
      return (await db.all<{ id: string; name: string; latex: string; conditions: string | null; topic: string | null }>(
        `SELECT x.id, x.name, x.latex, x.conditions, ${topic} AS topic FROM formulas x WHERE x.chapter_id = ? AND ${where('x')} ORDER BY x.name LIMIT ? OFFSET ?`, [chapterId, limit, offset]))
        .map((r) => ({ kind, id: r.id, title: r.name, detail: `${richToReadable(`$${r.latex}$`)}${r.conditions ? `\nCondition: ${r.conditions}` : ''}`, topic: r.topic, meta: '' }));
    }
    if (kind === 'video') {
      return (await db.all<{ id: string; title: string; channel: string; url: string; why: string | null; topic: string | null }>(
        `SELECT x.id, x.title, x.channel, x.url, x.why, ${topic} AS topic FROM video_resources x WHERE x.chapter_id = ? AND ${where('x')} ORDER BY x.title LIMIT ? OFFSET ?`, [chapterId, limit, offset]))
        .map((r) => ({ kind, id: r.id, title: r.title, detail: `${r.channel}\n${r.url}${r.why ? `\n${r.why}` : ''}`, topic: r.topic, meta: 'Open the link and watch before confirming' }));
    }
    // Questions are shown WITH their answer key, because checking the key is the point of this screen.
    const rows = await db.all<{ id: string; stem: string; type: string; options_json: string | null; origin: string; answer_json: string; explanation: string | null; topic: string | null }>(
      `SELECT x.id, x.stem, x.type, x.options_json, x.origin, qs.answer_json, qs.explanation, ${topic} AS topic FROM questions x JOIN question_solutions qs ON qs.question_id = x.id
       WHERE x.chapter_id = ? AND ${where('x')} ORDER BY x.created_at LIMIT ? OFFSET ?`, [chapterId, limit, offset]);
    return rows.map((r) => {
      const opts: string[] = r.options_json ? JSON.parse(r.options_json) : [];
      const ans = JSON.parse(r.answer_json) as { correct?: string[]; numeric?: number };
      const optText = opts.map((o, i) => `${'ABCDEF'[i]}. ${richToReadable(o)}`).join('\n');
      const key = ans.numeric !== undefined ? `Answer: ${ans.numeric}` : `Answer: ${(ans.correct ?? []).join(', ')}`;
      return { kind, id: r.id, title: richToReadable(r.stem), detail: `${optText ? `${optText}\n` : ''}${key}${r.explanation ? `\nWhy: ${richToReadable(r.explanation)}` : ''}`, topic: r.topic, meta: r.origin === 'generated' ? 'AI/ORBIT-generated' : r.origin };
    });
  },

  /** Mark one item as checked by a person. Questions also confirm their answer key. */
  async confirm(db: SqlDb, kind: ReviewKind, id: string): Promise<void> {
    await db.tx(async () => {
      if (kind === 'video') await updateRow(db, 'video_resources', id, { verification_status: 'verified', link_checked_at: new Date().toISOString() });
      else await updateRow(db, TABLE[kind], id, { verification_status: 'verified' });
      if (kind === 'question') {
        const s = await db.first<{ id: string }>('SELECT id FROM question_solutions WHERE question_id = ?', [id]);
        if (s) await updateRow(db, 'question_solutions', s.id, { verification_status: 'verified' });
      }
      // The student's own check is recorded in the history. It is evidence for the reviewer, never academic approval.
      await reviewsRepo.add(db, { kind, recordId: id, decision: 'approved', reviewerName: 'Student', role: 'student', feedback: 'Checked by the student against a book or teacher.' });
    });
  },
};
