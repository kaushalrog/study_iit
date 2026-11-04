/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { loadStarterLibrary } from '../../src/content/starter';
import { coverageRepo } from '../../src/database/repositories/coverage';
import { questionRepo } from '../../src/database/repositories/questions';
import { reviewRepo } from '../../src/database/repositories/review';
import { seedInitialData, IDS } from '../../src/database/seed';
import { memoryDb } from '../unit/sqlite-harness';

it('confirming moves material into the verified library and the practice bank, one item at a time', async () => {
  const db = memoryDb(); await migrate(db); await seedInitialData(db); await loadStarterLibrary(db);
  const G = IDS.chapter.gravitation;
  const before = await reviewRepo.counts(db, G);
  expect(before.question).toBeGreaterThan(0);
  const [q] = await reviewRepo.list(db, G, 'question', 1);
  expect(q.detail).toMatch(/Answer:/);          // the key is visible to the reviewer
  expect(q.meta).toMatch(/generated/i);
  await reviewRepo.confirm(db, 'question', q.id);
  expect((await reviewRepo.counts(db, G)).question).toBe(before.question - 1);
  expect((await questionRepo.list(db, { chapterId: G })).length).toBe(1);   // now usable in practice
  const [l] = await reviewRepo.list(db, G, 'lesson', 1);
  await reviewRepo.confirm(db, 'lesson', l.id);
  const g = (await coverageRepo.load(db)).find((c) => c.chapterId === G)!;
  expect(g.counts.practice.verified).toBe(1);
  expect(g.status).not.toBe('complete');          // one confirmed item never makes a chapter complete
  const [v] = await reviewRepo.list(db, G, 'video', 1);
  await reviewRepo.confirm(db, 'video', v.id);
  const row = await db.first<{ verification_status: string; link_checked_at: string | null }>('SELECT verification_status, link_checked_at FROM video_resources WHERE id = ?', [v.id]);
  expect(row!.verification_status).toBe('verified'); expect(row!.link_checked_at).toBeTruthy();
});
