import { z } from 'zod';
import { LESSON_SECTIONS, LessonSection, ParsedBundle } from '../../features/syllabus/importBundle';
import { newId, seedId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { updateRow, upsertRow } from './base';
import { questionRepo } from './questions';
import { reviewsRepo } from './reviews';
import { parseYoutube } from '../../features/content/youtube';
import { videoRepo } from './videos';

const status = (verified: boolean) => (verified ? 'verified' : 'needs_review');

export const newLessonSchema = z.object({
  chapterId: z.string().min(1, 'Choose a chapter.'),
  topicId: z.string().nullable().default(null),
  section: z.enum(LESSON_SECTIONS),
  level: z.enum(['foundation', 'main', 'advanced']).default('main'),
  language: z.enum(['en', 'te']).default('en'),
  body: z.string().trim().min(3, 'Write the lesson text.'),
  sourceNote: z.string().default(''),
  verified: z.boolean().default(false),
});
export type NewLesson = z.input<typeof newLessonSchema>;

export const newFormulaSchema = z.object({
  chapterId: z.string().min(1, 'Choose a chapter.'),
  topicId: z.string().nullable().default(null),
  name: z.string().trim().min(2, 'Give the formula a name.'),
  latex: z.string().trim().min(1, 'Write the formula.'),
  variables: z.array(z.object({ symbol: z.string().trim().min(1), meaning: z.string().trim().min(1), unit: z.string().trim().optional() })).default([]),
  units: z.string().default(''), conditions: z.string().default(''), explanation: z.string().default(''), example: z.string().default(''),
  sourceNote: z.string().default(''), verified: z.boolean().default(false),
});
export type NewFormula = z.input<typeof newFormulaSchema>;

export interface TopicRow { id: string; title: string; status: string; chapterId: string }
export interface LessonRow { id: string; section: LessonSection; level: string; language: 'en' | 'te'; body: string; topicId: string | null; verification: string; sourceNote: string | null }
export interface FormulaRow {
  id: string; name: string; latex: string; topicId: string | null; variables: { symbol: string; meaning: string; unit?: string }[];
  units: string | null; conditions: string | null; explanation: string | null; example: string | null; sourceNote: string | null; verification: string;
}

export interface ImportCounts { topics: number; lessons: number; formulas: number; questions: number; videos: number }
export interface ImportReport { added: ImportCounts; skipped: ImportCounts; chapterTitle: string }

const zero = (): ImportCounts => ({ topics: 0, lessons: 0, formulas: 0, questions: 0, videos: 0 });
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const hash = (s: string) => seedId(s).slice(0, 18);

export const contentRepo = {
  async topics(db: SqlDb, chapterId: string): Promise<TopicRow[]> {
    const r = await db.all<{ id: string; title: string; status: string; chapter_id: string }>(
      'SELECT id, title, status, chapter_id FROM topics WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY sort_order, created_at', [chapterId]);
    return r.map((t) => ({ id: t.id, title: t.title, status: t.status, chapterId: t.chapter_id }));
  },

  /** Adds a topic, or returns the existing one with the same title (case-insensitive) so topics never duplicate. */
  async ensureTopic(db: SqlDb, chapterId: string, title: string, id?: string): Promise<{ id: string; created: boolean }> {
    const t = title.trim();
    if (!t) throw new Error('Give the topic a name.');
    const existing = (await this.topics(db, chapterId)).find((x) => norm(x.title) === norm(t));
    if (existing) return { id: existing.id, created: false };
    const max = (await db.first<{ m: number | null }>('SELECT MAX(sort_order) AS m FROM topics WHERE chapter_id = ?', [chapterId]))?.m ?? 0;
    const tid = id ?? newId();
    await upsertRow(db, 'topics', { id: tid, chapter_id: chapterId, title: t, sort_order: max + 1, status: 'not_started', verification_status: 'verified' });
    return { id: tid, created: true };
  },

  async addLesson(db: SqlDb, input: NewLesson, id?: string): Promise<string> {
    const v = newLessonSchema.parse(input);
    const lid = id ?? newId();
    await upsertRow(db, 'learning_content', {
      id: lid, chapter_id: v.chapterId, topic_id: v.topicId, section: v.section, language: v.language, level: v.level, body: v.body,
      sort_order: LESSON_SECTIONS.indexOf(v.section), verification_status: status(v.verified), source_note: v.sourceNote || null,
    });
    return lid;
  },
  async updateLesson(db: SqlDb, id: string, patch: { body?: string; verified?: boolean }): Promise<void> {
    const cur = await db.first<{ body: string }>('SELECT body FROM learning_content WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!cur) throw new Error('Lesson not found.');
    const body = (patch.body ?? cur.body).trim();
    if (body.length < 3) throw new Error('Write the lesson text.');
    const row: Record<string, string | number | null> = { body };
    if (patch.verified !== undefined) row.verification_status = status(patch.verified);
    await db.tx(async () => {
      await updateRow(db, 'learning_content', id, row);
      // Revision history: keep the previous text so an earlier version can be recovered and a reviewer can see what changed.
      if (body !== cur.body) await reviewsRepo.add(db, { kind: 'lesson', recordId: id, decision: 'edited', reviewerName: 'Student', role: 'student', feedback: 'Text edited.', evidence: `Previous text:\n${cur.body}` });
    });
  },
  async removeLesson(db: SqlDb, id: string): Promise<void> {
    await updateRow(db, 'learning_content', id, { deleted_at: new Date().toISOString() });
  },

  async lesson(db: SqlDb, id: string): Promise<(LessonRow & { chapterId: string }) | null> {
    const l = await db.first<{ id: string; chapter_id: string; section: LessonSection; level: string; language: 'en' | 'te'; body: string; topic_id: string | null; verification_status: string; source_note: string | null }>(
      'SELECT id, chapter_id, section, level, language, body, topic_id, verification_status, source_note FROM learning_content WHERE id = ? AND deleted_at IS NULL', [id]);
    return l ? { id: l.id, chapterId: l.chapter_id, section: l.section, level: l.level, language: l.language, body: l.body, topicId: l.topic_id, verification: l.verification_status, sourceNote: l.source_note } : null;
  },

  /** Every lesson for the chapter and language, in teaching order. Unverified ones are returned too; the UI labels them. */
  async lessons(db: SqlDb, chapterId: string, language: 'en' | 'te'): Promise<LessonRow[]> {
    const r = await db.all<{ id: string; section: LessonSection; level: string; language: 'en' | 'te'; body: string; topic_id: string | null; verification_status: string; source_note: string | null }>(
      `SELECT id, section, level, language, body, topic_id, verification_status, source_note FROM learning_content
       WHERE chapter_id = ? AND language = ? AND deleted_at IS NULL AND verification_status != 'archived' ORDER BY sort_order, created_at`, [chapterId, language]);
    return r.map((l) => ({ id: l.id, section: l.section, level: l.level, language: l.language, body: l.body, topicId: l.topic_id, verification: l.verification_status, sourceNote: l.source_note }));
  },

  async addFormula(db: SqlDb, input: NewFormula, id?: string): Promise<string> {
    const v = newFormulaSchema.parse(input);
    const fid = id ?? newId();
    await upsertRow(db, 'formulas', {
      id: fid, chapter_id: v.chapterId, topic_id: v.topicId, name: v.name, latex: v.latex, variables_json: JSON.stringify(v.variables),
      units: v.units || null, conditions: v.conditions || null, explanation: v.explanation || null, example: v.example || null,
      source_note: v.sourceNote || null, verification_status: status(v.verified),
    });
    return fid;
  },
  async removeFormula(db: SqlDb, id: string): Promise<void> {
    await updateRow(db, 'formulas', id, { deleted_at: new Date().toISOString() });
  },
  async formulas(db: SqlDb, chapterId: string): Promise<FormulaRow[]> {
    const r = await db.all<Record<string, string | null>>(
      `SELECT id, name, latex, topic_id, variables_json, units, conditions, explanation, example, source_note, verification_status FROM formulas
       WHERE chapter_id = ? AND deleted_at IS NULL AND verification_status != 'archived' ORDER BY name`, [chapterId]);
    return r.map((f) => ({
      id: f.id as string, name: f.name as string, latex: f.latex as string, topicId: f.topic_id, variables: JSON.parse((f.variables_json as string) || '[]'),
      units: f.units, conditions: f.conditions, explanation: f.explanation, example: f.example, sourceNote: f.source_note, verification: f.verification_status as string,
    }));
  },

  /**
   * Apply a parsed import. Ids are derived from the content, so importing the same file again changes nothing.
   * `verified` is the student's statement that she checked the material against her book or teacher.
   */
  async importBundle(db: SqlDb, chapterId: string, bundle: ParsedBundle, verified: boolean): Promise<ImportReport> {
    const added = zero(), skipped = zero();
    const chapter = await db.first<{ title: string }>('SELECT title FROM chapters WHERE id = ?', [chapterId]);
    if (!chapter) throw new Error('Chapter not found.');

    const topicId = async (title?: string): Promise<string | null> => {
      if (!title?.trim()) return null;
      const t = await this.ensureTopic(db, chapterId, title, seedId(`imp:topic:${chapterId}:${norm(title)}`));
      t.created ? added.topics++ : skipped.topics++;
      return t.id;
    };
    const exists = async (table: string, id: string) => !!(await db.first(`SELECT 1 AS x FROM ${table} WHERE id = ? AND deleted_at IS NULL`, [id]));

    await db.tx(async () => {
      for (const t of bundle.topics) await topicId(t);
      for (const l of bundle.lessons) {
        const id = seedId(`imp:lesson:${chapterId}:${norm(l.topic ?? '')}:${l.section}:${l.level}:${l.language}:${hash(norm(l.body))}`);
        if (await exists('learning_content', id)) { skipped.lessons++; continue; }
        await this.addLesson(db, { chapterId, topicId: await topicId(l.topic), section: l.section, level: l.level, language: l.language, body: l.body, sourceNote: l.source ?? '', verified }, id);
        added.lessons++;
      }
      for (const f of bundle.formulas) {
        const id = seedId(`imp:formula:${chapterId}:${norm(f.name)}:${hash(f.latex.replace(/\s+/g, ''))}`);
        if (await exists('formulas', id)) { skipped.formulas++; continue; }
        await this.addFormula(db, { chapterId, topicId: await topicId(f.topic), name: f.name, latex: f.latex, variables: f.variables, units: f.units ?? '', conditions: f.conditions ?? '',
          explanation: f.explanation ?? '', example: f.example ?? '', sourceNote: f.source ?? '', verified }, id);
        added.formulas++;
      }
      for (const q of bundle.questions) {
        const id = seedId(`imp:question:${chapterId}:${hash(norm(q.stem))}:${q.type}`);
        if (await exists('questions', id)) { skipped.questions++; continue; }
        await questionRepo.add(db, { chapterId, type: q.type, stem: q.stem, options: q.options, correct: q.correct, numeric: q.numeric ?? null, tolerance: q.tolerance ?? 0,
          difficulty: q.difficulty, origin: q.origin ?? 'coaching', explanation: q.explanation ?? '', hint: q.hint ?? '', sourceNote: q.source ?? '', verified,
          examCategory: q.examCategory ?? null, examYear: q.examYear ?? null, examSession: q.session ?? '', citation: q.citation ?? '', citationUrl: q.citationUrl ?? '', license: q.license ?? 'unknown' }, id);
        added.questions++;
      }
      for (const v of bundle.videos) {
        const tid = await topicId(v.topic);
        // videoRepo.add keys on (link, place), so a second import updates the same row. Count it as skipped when it already exists.
        const ref = parseYoutube(v.url)!;
        const id = seedId(`video:${ref.kind}:${ref.id}:${tid ?? chapterId}`);
        const had = await exists('video_resources', id);
        await videoRepo.add(db, { chapterId, topicId: tid, url: v.url, title: v.title, channel: v.channel, purpose: v.purpose, level: v.level, language: v.language, why: v.why ?? '', sourceNote: v.source ?? '', durationSeconds: v.durationSeconds ?? null, verified: false });
        had ? skipped.videos++ : added.videos++;
      }
    });
    return { added, skipped, chapterTitle: chapter.title };
  },

  /** Match the chapter named in an import to a registered chapter (case-insensitive). */
  async resolveChapter(db: SqlDb, name: string): Promise<{ id: string; title: string } | null> {
    const rows = await db.all<{ id: string; title: string }>('SELECT id, title FROM chapters WHERE deleted_at IS NULL');
    const n = norm(name);
    return rows.find((r) => norm(r.title) === n) ?? rows.find((r) => norm(r.title).includes(n) || n.includes(norm(r.title))) ?? null;
  },
};
