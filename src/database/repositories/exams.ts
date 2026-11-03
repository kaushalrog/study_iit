import { z } from 'zod';
import { examConfigSchema, ExamConfig, SubjectKey } from '../../features/exam-engine/types';
import { newId, seedId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { updateRow, upsertRow } from './base';

export interface ExamRow {
  id: string; name: string; style: 'main' | 'advanced'; examDate: string;
  status: string; totalScore: number | null; maxScore: number | null; templateId: string | null;
  entryMode: string;
  syllabus: { chapterId: string; title: string; subject: SubjectKey }[];
}

export const manualResultSchema = z.object({
  examId: z.string().uuid(),
  subjects: z.array(z.object({
    subject: z.enum(['math', 'physics', 'chemistry']),
    marks: z.number(),
    maxMarks: z.number().positive(),
  })).min(1),
}).refine((v) => v.subjects.every((s) => s.marks <= s.maxMarks), { message: 'Marks cannot exceed the maximum.' });
export type ManualResult = z.infer<typeof manualResultSchema>;

export interface TemplateRow { id: string; name: string; style: 'main' | 'advanced'; durationMinutes: number | null; negativeMarking: boolean; sections: number; verification: string; sourceNote: string | null }

export const examRepo = {
  async templates(db: SqlDb): Promise<TemplateRow[]> {
    const r = await db.all<{ id: string; name: string; style: 'main' | 'advanced'; duration_minutes: number | null; negative_marking_enabled: number; verification_status: string; source_note: string | null; n: number }>(
      `SELECT t.id, t.name, t.style, t.duration_minutes, t.negative_marking_enabled, t.verification_status, t.source_note,
         (SELECT COUNT(*) FROM exam_sections s WHERE s.template_id = t.id AND s.deleted_at IS NULL) AS n
       FROM exam_templates t WHERE t.deleted_at IS NULL ORDER BY t.style`);
    return r.map((t) => ({ id: t.id, name: t.name, style: t.style, durationMinutes: t.duration_minutes, negativeMarking: !!t.negative_marking_enabled, sections: t.n, verification: t.verification_status, sourceNote: t.source_note }));
  },

  /**
   * Replace a template's pattern. Sections keep stable ids per (template, key), removed ones are soft-deleted
   * (so the removal syncs), and "verified" is only ever the student's own statement that she checked the paper.
   */
  async saveTemplate(db: SqlDb, templateId: string, config: ExamConfig, opts: { verified: boolean; sourceNote?: string }): Promise<void> {
    const v = examConfigSchema.parse(config);
    const now = new Date().toISOString();
    await db.tx(async () => {
      await updateRow(db, 'exam_templates', templateId, {
        name: v.name, duration_minutes: v.durationMinutes, negative_marking_enabled: v.negativeMarkingEnabled ? 1 : 0,
        verification_status: opts.verified ? 'verified' : 'needs_review', source_note: opts.sourceNote ?? null,
      });
      const existing = await db.all<{ id: string; section_key: string; deleted_at: string | null }>('SELECT id, section_key, deleted_at FROM exam_sections WHERE template_id = ?', [templateId]);
      const byKey = new Map(existing.map((e) => [e.section_key, e]));
      const keep = new Set(v.sections.map((x) => x.id));
      for (const e of existing) if (!keep.has(e.section_key) && !e.deleted_at) await updateRow(db, 'exam_sections', e.id, { deleted_at: now });
      for (const [i, sec] of v.sections.entries()) {
        const sid = byKey.get(sec.id)?.id ?? seedId(`section:${templateId}:${sec.id}`);
        await upsertRow(db, 'exam_sections', {
          id: sid, template_id: templateId, section_key: sec.id, name: sec.name, subject_key: sec.subject, question_type: sec.questionType,
          question_count: sec.questionCount, attempt_limit: sec.attemptLimit, sort_order: i, deleted_at: null,
        });
        const rule = await db.first<{ id: string }>('SELECT id FROM scoring_rules WHERE section_id = ?', [sid]);
        await upsertRow(db, 'scoring_rules', {
          id: rule?.id ?? seedId(`rule:${sid}`), section_id: sid, correct: sec.rule.correct, incorrect: sec.rule.incorrect,
          unanswered: sec.rule.unanswered, partial_per_correct_option: sec.rule.partialPerCorrectOption, deleted_at: null,
        });
      }
    });
  },

  async list(db: SqlDb): Promise<ExamRow[]> {
    const rows = await db.all<Record<string, string | number | null>>('SELECT * FROM exams WHERE deleted_at IS NULL ORDER BY exam_date');
    return rows.map((r) => ({
      id: r.id as string, name: r.name as string, style: r.style as 'main' | 'advanced', examDate: r.exam_date as string,
      status: r.status as string, totalScore: r.total_score as number | null, maxScore: r.max_score as number | null,
      templateId: r.template_id as string | null, entryMode: r.entry_mode as string, syllabus: JSON.parse((r.syllabus_json as string) || '[]'),
    }));
  },

  /** Load a template as a validated ExamConfig. Returns null when it has no sections yet. */
  async templateConfig(db: SqlDb, templateId: string): Promise<ExamConfig | null> {
    const t = await db.first<{ name: string; style: 'main' | 'advanced'; duration_minutes: number | null; negative_marking_enabled: number }>(
      'SELECT * FROM exam_templates WHERE id = ?', [templateId]);
    if (!t) return null;
    const sections = await db.all<{
      section_key: string; name: string; subject_key: string; question_type: string; question_count: number; attempt_limit: number | null;
      correct: number; incorrect: number; unanswered: number; partial_per_correct_option: number | null;
    }>(`SELECT s.*, r.correct, r.incorrect, r.unanswered, r.partial_per_correct_option
        FROM exam_sections s JOIN scoring_rules r ON r.section_id = s.id WHERE s.template_id = ? AND s.deleted_at IS NULL ORDER BY s.sort_order`, [templateId]);
    return examConfigSchema.parse({
      name: t.name, style: t.style, durationMinutes: t.duration_minutes, negativeMarkingEnabled: !!t.negative_marking_enabled,
      sections: sections.map((s) => ({
        id: s.section_key, name: s.name, subject: s.subject_key, questionType: s.question_type, questionCount: s.question_count,
        attemptLimit: s.attempt_limit,
        rule: { correct: s.correct, incorrect: s.incorrect, unanswered: s.unanswered, partialPerCorrectOption: s.partial_per_correct_option },
      })),
    });
  },

  /**
   * Record a result when question-level data is unavailable. The caller must have shown the
   * numbers to the student for confirmation (also required for image-extracted scores).
   * History is preserved: re-entering a result updates the same exam only for that exam id.
   */
  async saveManualResult(db: SqlDb, input: ManualResult, now = new Date()): Promise<void> {
    const v = manualResultSchema.parse(input);
    const total = v.subjects.reduce((a, s) => a + s.marks, 0);
    const max = v.subjects.reduce((a, s) => a + s.maxMarks, 0);
    await updateRow(db, 'exams', v.examId, {
      status: 'completed', entry_mode: 'manual', finished_at: now.toISOString(), total_score: total, max_score: max,
    });
    for (const s of v.subjects) {
      const existing = await db.first<{ id: string }>('SELECT id FROM exam_subject_results WHERE exam_id = ? AND subject_key = ?', [v.examId, s.subject]);
      await upsertRow(db, 'exam_subject_results', {
        id: existing?.id ?? newId(), exam_id: v.examId, subject_key: s.subject, marks: s.marks, max_marks: s.maxMarks,
      });
    }
  },

  async history(db: SqlDb) {
    return db.all<{ id: string; name: string; style: string; exam_date: string; total_score: number; max_score: number; entry_mode: string }>(
      `SELECT id, name, style, exam_date, total_score, max_score, entry_mode FROM exams WHERE status = 'completed' AND deleted_at IS NULL ORDER BY exam_date`);
  },
};
