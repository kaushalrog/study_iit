import { contentRepo, ImportReport } from '../database/repositories/content';
import { reviewsRepo } from '../database/repositories/reviews';
import { parseImport, ParsedBundle } from '../features/syllabus/importBundle';
import type { SqlDb } from '../database/sqlite/types';

/**
 * ORBIT's starter library: original lessons, formulas, practice questions and video links for the four current chapters.
 * Written in the same JSON format as the bulk importer (content/*.json, built by content/src/*.py, whose answer keys are
 * checked numerically). Everything is loaded as "needs review": nothing here is verified until a person confirms it.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const RETIRED = require('../../content/retired.json') as { retired: { chapter: string; kind: 'lesson' | 'formula'; topic?: string | null; section?: string; level?: string; language?: string; body?: string; reason: string }[] };
const EVIDENCE = require('../../content/audit/evidence.json') as { generated: string; evidence: { formula: Record<string, { check: string; passed: boolean }[]>; question: Record<string, { check: string; passed: boolean }[]> } };
const AI = require('../../content/audit/ai-review.json') as { reviewer: string; date: string; scope: string; questionNote: string; formulaFindings: Record<string, string> };
const FILES: unknown[] = [
  require('../../content/inverse-trigonometry.json'),
  require('../../content/binomial-theorem.json'),
  require('../../content/gravitation.json'),
  require('../../content/chemical-kinetics.json'),
];

export function starterBundles(): { bundles: ParsedBundle[]; problems: string[] } {
  const parsed = parseImport(JSON.stringify(FILES));
  return { bundles: parsed.bundles, problems: parsed.issues.map((i) => `${i.where}: ${i.message}`) };
}

export interface StarterTotals { topics: number; lessons: number; formulas: number; questions: number; videos: number }
export const starterTotals = (): StarterTotals => starterBundles().bundles.reduce((a, b) => ({
  topics: a.topics + b.topics.length, lessons: a.lessons + b.lessons.length, formulas: a.formulas + b.formulas.length, questions: a.questions + b.questions.length, videos: a.videos + b.videos.length,
}), { topics: 0, lessons: 0, formulas: 0, questions: 0, videos: 0 });

/** Safe to run more than once: ids come from the content, so repeats change nothing. */
export async function loadStarterLibrary(db: SqlDb): Promise<ImportReport[]> {
  const { bundles, problems } = starterBundles();
  if (problems.length) throw new Error(`Starter content is invalid: ${problems[0]}`);
  const reports: ImportReport[] = [];
  for (const b of bundles) {
    const ch = await contentRepo.resolveChapter(db, b.chapter);
    if (!ch) continue; // chapter not in this student's library
    reports.push(await contentRepo.importBundle(db, ch.id, b, false));
  }
  // Corrections: withdraw old versions that were replaced, then attach the audit evidence. Both are safe to repeat.
  for (const r of RETIRED.retired) {
    if (r.kind !== 'lesson') continue;
    const ch = await contentRepo.resolveChapter(db, r.chapter);
    if (ch && r.section && r.level && r.language && r.body) await contentRepo.retireLesson(db, ch.id, { topic: r.topic, section: r.section, level: r.level, language: r.language, body: r.body, reason: r.reason });
  }
  await attachEvidence(db);
  return reports;
}

/**
 * Record what was checked and by whom. Build-script results are AUTOMATED evidence and the AI pass is an ai_assistant comment.
 * Neither can make anything academically approved (see features/review/rules.ts).
 */
export async function attachEvidence(db: SqlDb): Promise<number> {
  let n = 0;
  const at = `${EVIDENCE.generated}T00:00:00.000Z`;
  for (const [name, checks] of Object.entries(EVIDENCE.evidence.formula)) {
    const row = await db.first<{ id: string }>('SELECT id FROM formulas WHERE name = ? AND deleted_at IS NULL', [name]);
    if (!row) continue;
    const res = await reviewsRepo.add(db, { kind: 'formula', recordId: row.id, decision: 'comment', reviewerName: 'ORBIT audit script', role: 'automated', reviewedAt: at,
      feedback: checks.every((c) => c.passed) ? 'All automated checks passed.' : 'Some automated checks FAILED.', evidence: checks.map((c) => `${c.passed ? 'PASS' : 'FAIL'}: ${c.check}`).join('\n') });
    if (res.created) n++;
    const note = AI.formulaFindings[name];
    if (note) { if ((await reviewsRepo.add(db, { kind: 'formula', recordId: row.id, decision: 'comment', reviewerName: AI.reviewer, role: 'ai_assistant', reviewedAt: `${AI.date}T00:00:00.000Z`, feedback: note, evidence: AI.scope })).created) n++; }
  }
  for (const [stem, checks] of Object.entries(EVIDENCE.evidence.question)) {
    const row = await db.first<{ id: string }>('SELECT id FROM questions WHERE stem = ? AND deleted_at IS NULL', [stem]);
    if (!row) continue;
    if ((await reviewsRepo.add(db, { kind: 'question', recordId: row.id, decision: 'comment', reviewerName: 'ORBIT audit script', role: 'automated', reviewedAt: at,
      feedback: checks.every((c) => c.passed) ? 'All automated checks passed.' : 'Some automated checks FAILED.', evidence: checks.map((c) => `${c.passed ? 'PASS' : 'FAIL'}: ${c.check}`).join('\n') })).created) n++;
  }
  // The AI read-through covered every generated question; record it on each (formulas get theirs from the findings above).
  for (const q of await db.all<{ id: string }>("SELECT id FROM questions WHERE origin = 'generated' AND deleted_at IS NULL")) {
    if ((await reviewsRepo.add(db, { kind: 'question', recordId: q.id, decision: 'comment', reviewerName: AI.reviewer, role: 'ai_assistant', reviewedAt: `${AI.date}T00:00:00.000Z`, feedback: AI.questionNote, evidence: AI.scope })).created) n++;
  }
  return n;
}
