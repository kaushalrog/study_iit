import { contentRepo, ImportReport } from '../database/repositories/content';
import { parseImport, ParsedBundle } from '../features/syllabus/importBundle';
import type { SqlDb } from '../database/sqlite/types';

/**
 * ORBIT's starter library: original lessons, formulas, practice questions and video links for the four current chapters.
 * Written in the same JSON format as the bulk importer (content/*.json, built by content/src/*.py, whose answer keys are
 * checked numerically). Everything is loaded as "needs review": nothing here is verified until a person confirms it.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
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
  return reports;
}
