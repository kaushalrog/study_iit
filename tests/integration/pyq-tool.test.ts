/** @jest-environment node */
import { execFileSync } from 'child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { migrate } from '../../src/database/migrations';
import { coverageRepo } from '../../src/database/repositories/coverage';
import { contentRepo } from '../../src/database/repositories/content';
import { questionRepo } from '../../src/database/repositories/questions';
import { seedInitialData } from '../../src/database/seed';
import { parseImport } from '../../src/features/syllabus/importBundle';
import { memoryDb } from '../unit/sqlite-harness';

// A SYNTHETIC review file (not an exam paper) pushed through the real tool and the real importer.
it('bundles from the PYQ tool import as unverified PYQs with full provenance, never as practice questions', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'pyq-'));
  const review = { source: { exam: 'jee_advanced', year: 2022, session: 'Paper 1', paper: '', sourceUrl: 'https://example.org/synthetic.pdf', license: 'unknown' }, questions: [
    { number: 3, stem: 'Synthetic question about escape velocity?', options: ['a', 'b', 'c', 'd'], type: 'single', chapter: 'Gravitation', topic: 'Gravitational potential energy and escape velocity', difficulty: 'advanced', answer: 3, solution: 'Synthetic.', reviewed: true },
    { number: 4, stem: 'Left out: no answer', options: ['a', 'b'], type: 'single', chapter: 'Gravitation', topic: '', difficulty: 'main', answer: null, solution: '', reviewed: true },
  ] };
  writeFileSync(join(dir, 'review.json'), JSON.stringify(review));
  execFileSync('python3', [join(__dirname, '../../tools/pyq/pyq_extract.py'), 'bundle', join(dir, 'review.json'), '-o', join(dir, 'out')]);
  const text = readFileSync(join(dir, 'out', 'gravitation.json'), 'utf8');
  const parsed = parseImport(text);
  expect(parsed.issues).toEqual([]);
  const db = memoryDb(); await migrate(db); await seedInitialData(db);
  const ch = (await contentRepo.resolveChapter(db, 'Gravitation'))!;
  const rep = await contentRepo.importBundle(db, ch.id, parsed.bundles[0], false);
  expect(rep.added.questions).toBe(1);
  const row = (await db.first<{ origin: string; exam_category: string; exam_year: number; citation: string; citation_url: string; license: string; verification_status: string }>('SELECT origin, exam_category, exam_year, citation, citation_url, license, verification_status FROM questions'))!;
  expect(row).toMatchObject({ origin: 'official', exam_category: 'jee_advanced', exam_year: 2022, citation: 'JEE Advanced, 2022, Paper 1, Question 3', citation_url: 'https://example.org/synthetic.pdf', license: 'unknown', verification_status: 'needs_review' });
  expect((await questionRepo.list(db)).length).toBe(0);                      // not in the practice bank until a person confirms it
  const g = (await coverageRepo.load(db)).find((c) => c.chapterId === ch.id)!;
  expect(g.counts.pyq).toEqual({ verified: 0, unverified: 1 });              // counted as an unverified PYQ, not a verified one
});
