/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { loadStarterLibrary, starterBundles, starterTotals } from '../../src/content/starter';
import { contentRepo } from '../../src/database/repositories/content';
import { reviewsRepo } from '../../src/database/repositories/reviews';
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

describe('corrections and audit evidence', () => {
  it('every audit-evidence key matches a real record (no orphaned evidence)', async () => {
    const ev = require('../../content/audit/evidence.json').evidence as { formula: Record<string, unknown>; question: Record<string, unknown> };
    const db = await fresh(); await loadStarterLibrary(db);
    for (const name of Object.keys(ev.formula)) expect(await db.first('SELECT 1 AS x FROM formulas WHERE name = ?', [name])).not.toBeNull();
    for (const stem of Object.keys(ev.question)) expect(await db.first('SELECT 1 AS x FROM questions WHERE stem = ?', [stem])).not.toBeNull();
  });

  it('records automated and AI evidence, and none of it approves anything', async () => {
    const db = await fresh(); await loadStarterLibrary(db);
    const roles = await db.all<{ reviewer_role: string; n: number }>('SELECT reviewer_role, COUNT(*) n FROM content_reviews GROUP BY reviewer_role');
    const by = Object.fromEntries(roles.map((r) => [r.reviewer_role, r.n]));
    expect(by.automated).toBeGreaterThan(40); expect(by.ai_assistant).toBeGreaterThanOrEqual(82);
    expect(by.academic_reviewer ?? 0).toBe(0);
    await reviewsRepo.setReviewers(db, ['Claude (AI assistant)', 'ORBIT audit script']);   // even if listed as reviewers, wrong role
    const t = await reviewsRepo.totals(db);
    expect(t.question.approved + t.formula.approved + t.lesson.approved + t.video.approved).toBe(0);
  });

  it('loading twice adds no evidence twice', async () => {
    const db = await fresh(); await loadStarterLibrary(db);
    const n = (await db.first<{ n: number }>('SELECT COUNT(*) n FROM content_reviews'))!.n;
    await loadStarterLibrary(db);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM content_reviews'))!.n).toBe(n);
  });

  it('a device that loaded the earlier pack gets the correction: old lesson withdrawn, new one added, formula details refreshed', async () => {
    const db = await fresh(); await loadStarterLibrary(db);
    const retired = (require('../../content/retired.json').retired as { kind: string; chapter: string; body?: string; topic?: string; section?: string; level?: string; language?: string }[]).filter((r) => r.kind === 'lesson');
    expect(retired.length).toBeGreaterThan(0);
    // simulate an older install: put the withdrawn lesson back as an unconfirmed lesson, and strip a formula's new details
    const g = (await contentRepo.resolveChapter(db, retired[0].chapter))!;
    const old = retired.find((r) => r.chapter === g.title)!;
    await contentRepo.importBundle(db, g.id, { chapter: g.title, topics: [], lessons: [{ topic: old.topic, section: old.section as never, level: old.level as never, language: 'en', body: old.body!, source: 'old' }], formulas: [], questions: [], videos: [] }, false);
    const fid = (await db.first<{ id: string }>("SELECT id FROM formulas WHERE name = 'Escape velocity'"))!.id;
    await db.run("UPDATE formulas SET variables_json = '[]', units = NULL WHERE id = ?", [fid]);
    const live = async () => (await db.first<{ n: number }>("SELECT COUNT(*) n FROM learning_content WHERE body LIKE '%few bacteria%' AND deleted_at IS NULL"))!.n;
    expect(await live()).toBe(1);
    const reports = await loadStarterLibrary(db);
    expect(await live()).toBe(0);
    expect((await db.first<{ n: number }>("SELECT COUNT(*) n FROM learning_content WHERE body LIKE '%grain of sand%' AND deleted_at IS NULL"))!.n).toBe(1);
    expect(reports.reduce((a, r) => a + r.updated, 0)).toBeGreaterThanOrEqual(1);
    const f = (await db.first<{ variables_json: string; units: string | null }>('SELECT variables_json, units FROM formulas WHERE id = ?', [fid]))!;
    expect(JSON.parse(f.variables_json).length).toBeGreaterThan(3); expect(f.units).toBe('m s⁻¹');
  });

  it('never overwrites a formula a person has already confirmed', async () => {
    const db = await fresh(); await loadStarterLibrary(db);
    const fid = (await db.first<{ id: string }>("SELECT id FROM formulas WHERE name = 'Escape velocity'"))!.id;
    await db.run("UPDATE formulas SET verification_status = 'verified', conditions = 'my own edit' WHERE id = ?", [fid]);
    await loadStarterLibrary(db);
    expect((await db.first<{ conditions: string }>('SELECT conditions FROM formulas WHERE id = ?', [fid]))!.conditions).toBe('my own edit');
  });
});
