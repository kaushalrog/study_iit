/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { loadStarterLibrary } from '../../src/content/starter';
import { contentRepo } from '../../src/database/repositories/content';
import { reviewRepo } from '../../src/database/repositories/review';
import { reviewsRepo } from '../../src/database/repositories/reviews';
import { videoRepo } from '../../src/database/repositories/videos';
import { IDS, seedInitialData } from '../../src/database/seed';
import { parseCsv, toCsv } from '../../src/features/review/csv';
import { memoryDb } from '../unit/sqlite-harness';

const G = IDS.chapter.gravitation;
async function lib() { const db = memoryDb(); await migrate(db); await seedInitialData(db); await loadStarterLibrary(db); return db; }
const firstOf = async (db: Awaited<ReturnType<typeof lib>>, table: string) => (await db.first<{ id: string }>(`SELECT id FROM ${table} WHERE chapter_id = ? AND deleted_at IS NULL ORDER BY created_at LIMIT 1`, [G]))!.id;

describe('academic review', () => {
  it('nobody can approve until the owner lists an authorised reviewer', async () => {
    const db = await lib(); const id = await firstOf(db, 'formulas');
    await expect(reviewsRepo.add(db, { kind: 'formula', recordId: id, decision: 'approved', reviewerName: 'Dr Rao', role: 'academic_reviewer' })).rejects.toThrow(/not on the list/);
    await reviewsRepo.setReviewers(db, ['Dr Rao']);
    await reviewsRepo.add(db, { kind: 'formula', recordId: id, decision: 'approved', reviewerName: 'dr rao', role: 'academic_reviewer', checks: { correctness: 'pass' }, reviewedAt: '2026-11-10' });
    expect((await reviewsRepo.status(db, 'formula', id)).status).toBe('approved');
  });

  it('student checks, video watching and AI/automated reviews never confer academic approval', async () => {
    const db = await lib(); await reviewsRepo.setReviewers(db, ['Dr Rao']);
    const q = await firstOf(db, 'questions'); const v = await firstOf(db, 'video_resources');
    await reviewRepo.confirm(db, 'question', q);                       // student confirms the key
    await videoRepo.markWatched(db, v, true); await videoRepo.setVerified(db, v, true);   // student watched and ticked
    await reviewsRepo.add(db, { kind: 'question', recordId: q, decision: 'approved', reviewerName: 'Claude', role: 'ai_assistant', evidence: 'Re-solved independently.' });
    await reviewsRepo.add(db, { kind: 'question', recordId: q, decision: 'approved', reviewerName: 'build-script', role: 'automated' });
    expect((await reviewsRepo.status(db, 'question', q)).status).toBe('unreviewed');
    expect((await reviewsRepo.status(db, 'video', v)).status).toBe('unreviewed');
    expect((await reviewsRepo.history(db, 'question', q)).map((r) => r.reviewerRole).sort()).toEqual(['ai_assistant', 'automated', 'student']);
    // an academic reviewer's name used with a non-academic role still does not count
    await reviewsRepo.add(db, { kind: 'question', recordId: q, decision: 'approved', reviewerName: 'Dr Rao', role: 'student' });
    expect((await reviewsRepo.status(db, 'question', q)).status).toBe('unreviewed');
  });

  it('an approval goes stale when the content is edited', async () => {
    const db = await lib(); await reviewsRepo.setReviewers(db, ['Dr Rao']);
    const l = await firstOf(db, 'learning_content');
    await reviewsRepo.add(db, { kind: 'lesson', recordId: l, decision: 'approved', reviewerName: 'Dr Rao', role: 'academic_reviewer' });
    expect((await reviewsRepo.status(db, 'lesson', l)).status).toBe('approved');
    await contentRepo.updateLesson(db, l, { body: 'A changed explanation of the same idea.' });
    expect((await reviewsRepo.status(db, 'lesson', l)).status).toBe('stale');
  });

  it('a reviewer rejection hides the record but keeps the reason in the history and the totals', async () => {
    const db = await lib(); await reviewsRepo.setReviewers(db, ['Dr Rao']);
    const q = await firstOf(db, 'questions');
    await reviewsRepo.add(db, { kind: 'question', recordId: q, decision: 'rejected', reviewerName: 'Dr Rao', role: 'academic_reviewer', feedback: 'Option C is also correct.' });
    expect((await db.first<{ deleted_at: string | null }>('SELECT deleted_at FROM questions WHERE id = ?', [q]))!.deleted_at).toBeTruthy();
    expect(await reviewsRepo.status(db, 'question', q)).toMatchObject({ status: 'rejected', feedback: 'Option C is also correct.' });
    const t = await reviewsRepo.totals(db, G);
    expect(t.question.rejected).toBe(1);
    expect(t.question.total).toBe(20);
  });

  it('adding the same review twice creates one row', async () => {
    const db = await lib(); await reviewsRepo.setReviewers(db, ['Dr Rao']); const id = await firstOf(db, 'formulas');
    const a = { kind: 'formula' as const, recordId: id, decision: 'comment' as const, reviewerName: 'Dr Rao', role: 'academic_reviewer' as const, reviewedAt: '2026-11-11' };
    expect((await reviewsRepo.add(db, a)).created).toBe(true);
    expect((await reviewsRepo.add(db, a)).created).toBe(false);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM content_reviews'))!.n).toBe(1);
  });
});

describe('review packets', () => {
  it('contain every record of the chapter exactly once, with ids and hashes', async () => {
    const db = await lib(); const p = await reviewsRepo.buildPacket(db, G, '2026-11-05');
    expect(p.counts).toEqual({ lesson: 42, formula: 11, question: 20, video: 4 });
    const rows = parseCsv(p.csv);
    expect(rows.length - 1).toBe(42 + 11 + 20 + 4);
    expect(new Set(rows.slice(1).map((r) => r[0])).size).toBe(rows.length - 1);
    expect(p.markdown).toMatch(/# Academic review packet: Gravitation/);
    expect(p.markdown).toMatch(/\*\*Key:\*\*/);
    expect((p.markdown.match(/^### \[/gm) ?? []).length).toBe(77);
  });

  it('a filled decision sheet imports once, validates each row, and re-importing adds nothing', async () => {
    const db = await lib(); await reviewsRepo.setReviewers(db, ['Dr Rao']);
    const { csv } = await reviewsRepo.buildPacket(db, G);
    const rows = parseCsv(csv); const h = rows[0]; const col = (n: string) => h.indexOf(n);
    const fill = (i: number, o: Record<string, string>) => { for (const [k, v] of Object.entries(o)) rows[i][col(k)] = v; };
    for (let i = 1; i <= 6; i++) fill(i, { decision: 'approved', correctness: 'pass', reviewer: 'Dr Rao', reviewed_at: '2026-11-12' });
    fill(7, { decision: 'rejected', reviewer: 'Dr Rao', reviewed_at: '2026-11-12' });                       // no feedback -> invalid row
    fill(8, { decision: 'approved', correctness: 'fail', reviewer: 'Dr Rao', reviewed_at: '2026-11-12' });  // approved with a failed check -> invalid
    fill(9, { decision: 'approved', reviewer: 'Nobody', reviewed_at: '2026-11-12' });                       // not authorised
    fill(10, { decision: 'approved', reviewer: 'Dr Rao', reviewed_at: 'yesterday' });                       // bad date
    fill(11, { decision: 'needs_research', feedback: 'Check the range convention', reviewer: 'Dr Rao', reviewed_at: '2026-11-12' });
    const out = toCsv(rows);
    const first = await reviewsRepo.importDecisions(db, out);
    expect(first.added).toBe(7);
    expect(first.rejected.map((r) => r.line).sort((a, b) => a - b)).toEqual([8, 9, 10, 11]);
    expect(first.rejected.find((r) => r.line === 10)!.reason).toMatch(/authorised/);
    const again = await reviewsRepo.importDecisions(db, out);
    expect(again.added).toBe(0); expect(again.duplicates).toBe(7);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM content_reviews'))!.n).toBe(7);
    const t = await reviewsRepo.totals(db, G);
    const approved = t.lesson.approved + t.formula.approved + t.question.approved + t.video.approved;
    expect(approved).toBe(6);
  });

  it('refuses decisions made against content that has since changed', async () => {
    const db = await lib(); await reviewsRepo.setReviewers(db, ['Dr Rao']);
    const { csv } = await reviewsRepo.buildPacket(db, G); const rows = parseCsv(csv); const h = rows[0];
    const lessonRow = rows.findIndex((r, i) => i > 0 && r[h.indexOf('kind')] === 'lesson');
    rows[lessonRow][h.indexOf('decision')] = 'approved'; rows[lessonRow][h.indexOf('reviewer')] = 'Dr Rao'; rows[lessonRow][h.indexOf('reviewed_at')] = '2026-11-12';
    await contentRepo.updateLesson(db, rows[lessonRow][0], { body: 'Edited after the packet was exported.' });
    const rep = await reviewsRepo.importDecisions(db, toCsv(rows));
    expect(rep.added).toBe(0); expect(rep.rejected[0].reason).toMatch(/changed after this packet/);
  });
});

it('editing a lesson keeps the previous text in the revision history', async () => {
  const db = await lib(); const l = await firstOf(db, 'learning_content');
  const before = (await db.first<{ body: string }>('SELECT body FROM learning_content WHERE id = ?', [l]))!.body;
  await contentRepo.updateLesson(db, l, { body: 'Version two of the text.' });
  const h = await reviewsRepo.history(db, 'lesson', l);
  expect(h).toHaveLength(1);
  expect(h[0]).toMatchObject({ decision: 'edited', reviewerRole: 'student' });
  expect(h[0].evidence).toContain(before);
});
