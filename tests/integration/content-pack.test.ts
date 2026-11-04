/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { loadStarterLibrary, starterBundles, starterTotals } from '../../src/content/starter';
import { coverageRepo } from '../../src/database/repositories/coverage';
import { questionRepo } from '../../src/database/repositories/questions';
import { searchRepo } from '../../src/database/repositories/search';
import { videoRepo } from '../../src/database/repositories/videos';
import { seedInitialData } from '../../src/database/seed';
import { parseYoutube } from '../../src/features/content/youtube';
import { memoryDb } from '../unit/sqlite-harness';

async function fresh() { const db = memoryDb(); await migrate(db); await seedInitialData(db); return db; }

describe('starter content pack', () => {
  it('parses with no issues and covers exactly the four current chapters', () => {
    const { bundles, problems } = starterBundles();
    expect(problems).toEqual([]);
    expect(bundles.map((b) => b.chapter)).toEqual(['Inverse Trigonometry', 'Binomial Theorem', 'Gravitation', 'Chemical Kinetics']);
  });

  it('every item carries a source note, questions are generated, videos are real links, nothing claims to be a PYQ', () => {
    for (const b of starterBundles().bundles) {
      expect(b.lessons.every((l) => !!l.source)).toBe(true);
      expect(b.formulas.every((f) => !!f.source)).toBe(true);
      expect(b.questions.every((q) => q.origin === 'generated' && !q.examCategory && !q.citation)).toBe(true);
      for (const v of b.videos) { expect(parseYoutube(v.url)).not.toBeNull(); expect(v.source).toMatch(/oEmbed/); expect(v.durationSeconds ?? null).toBeNull(); }
      const urls = b.videos.map((v) => v.url + (v.topic ?? ''));
      expect(new Set(urls).size).toBe(urls.length);
      // every lesson/formula/question/video topic exists in the topic list
      const topics = new Set(b.topics);
      for (const x of [...b.lessons, ...b.formulas, ...b.questions, ...b.videos]) if (x.topic) expect(topics.has(x.topic)).toBe(true);
    }
  });

  it('imports into the database, reports real counts and is idempotent', async () => {
    const db = await fresh();
    const totals = starterTotals();
    const first = await loadStarterLibrary(db);
    const sum = first.reduce((a, r) => ({ lessons: a.lessons + r.added.lessons, formulas: a.formulas + r.added.formulas, questions: a.questions + r.added.questions, videos: a.videos + r.added.videos, topics: a.topics + r.added.topics }), { lessons: 0, formulas: 0, questions: 0, videos: 0, topics: 0 });
    expect(sum).toEqual(totals);
    const again = await loadStarterLibrary(db);
    expect(again.reduce((a, r) => a + r.added.lessons + r.added.formulas + r.added.questions + r.added.videos + r.added.topics, 0)).toBe(0);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM learning_content'))!.n).toBe(totals.lessons);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM questions'))!.n).toBe(totals.questions);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM video_resources'))!.n).toBe(totals.videos);
  });

  it('nothing is verified on import: the practice bank stays empty, coverage shows unverified only, no PYQs', async () => {
    const db = await fresh(); await loadStarterLibrary(db);
    expect((await db.first<{ n: number }>("SELECT COUNT(*) n FROM learning_content WHERE verification_status IN ('verified','published')"))!.n).toBe(0);
    expect((await db.first<{ n: number }>("SELECT COUNT(*) n FROM questions WHERE verification_status IN ('verified','published')"))!.n).toBe(0);
    expect((await questionRepo.list(db)).length).toBe(0);
    const rep = await coverageRepo.load(db);
    for (const c of rep) {
      expect(c.counts.pyq).toEqual({ verified: 0, unverified: 0 });
      expect(c.counts.explanation.verified).toBe(0);
      expect(c.counts.explanation.unverified).toBeGreaterThan(0);
      expect(['unverified', 'partial']).toContain(c.status);
      expect(c.status).not.toBe('complete');
    }
    expect((await videoRepo.forChapter(db, rep[0].chapterId)).every((v) => v.verification === 'needs_review' && !v.linkCheckedAt)).toBe(true);
  });

  it('is searchable and answer keys are stored apart from the question text', async () => {
    const db = await fresh(); await loadStarterLibrary(db);
    expect((await searchRepo.search(db, 'escape velocity')).some((h) => h.kind === 'lesson' || h.kind === 'topic')).toBe(true);
    expect((await searchRepo.search(db, 'arrhenius')).length).toBeGreaterThan(0);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM question_solutions'))!.n).toBe(starterTotals().questions);
  });
});
