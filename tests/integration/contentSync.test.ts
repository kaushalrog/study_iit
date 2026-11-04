/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { questionRepo } from '../../src/database/repositories/questions';
import { reviewRepo } from '../../src/database/repositories/review';
import { videoRepo } from '../../src/database/repositories/videos';
import { seedInitialData, IDS } from '../../src/database/seed';
import { ContentRemote, Pack, PackMeta, loadState, pendingPacks, storedRoadmap, syncContent, versionAtLeast } from '../../src/services/content/contentSync';
import { packHash } from '../../src/services/content/sha256';
import { memoryDb } from '../unit/sqlite-harness';

const G = IDS.chapter.gravitation;
const gravitation = () => JSON.parse(JSON.stringify(require('../../content/gravitation.json')));
const small = () => ({ chapter: 'Gravitation', topics: ['Escape velocity'], lessons: [{ topic: 'Escape velocity', section: 'explanation', level: 'main', language: 'en', body: 'First version of the escape velocity explanation.', source: 'test' }], formulas: [], questions: [], videos: [] });

class FakeRemote implements ContentRemote {
  packs = new Map<string, Pack>(); offline = false; log: string[] = [];
  put(id: string, version: number, payload: unknown, o: Partial<Pack> = {}) {
    this.packs.set(id, { id, kind: 'bundle', version, title: id, payload, sha256: packHash(payload), updatedAt: new Date().toISOString(), deleted: false, minAppVersion: null, retired: [], ...o });
  }
  async manifest(): Promise<PackMeta[]> { this.log.push('manifest'); if (this.offline) throw new Error('Network request failed'); return [...this.packs.values()].map(({ payload: _p, retired: _r, ...m }) => m); }
  async pack(id: string): Promise<Pack> { this.log.push(`pack:${id}`); if (this.offline) throw new Error('Network request failed'); return this.packs.get(id)!; }
}
const fresh = async () => { const db = memoryDb(); await migrate(db); await seedInitialData(db); return db; };
const count = async (db: Awaited<ReturnType<typeof fresh>>, t: string) => (await db.first<{ n: number }>(`SELECT COUNT(*) n FROM ${t} WHERE deleted_at IS NULL`))!.n;

describe('content sync', () => {
  it('downloads a published chapter into SQLite, validates it, and arrives as needs-review', async () => {
    const db = await fresh(); const r = new FakeRemote(); r.put('chapter:gravitation', 1, gravitation());
    const res = await syncContent(db, r);
    expect(res.status).toBe('ok'); expect(res.applied[0]).toMatchObject({ id: 'chapter:gravitation', version: 1 }); expect(res.applied[0].added).toBeGreaterThan(70);
    expect(await count(db, 'learning_content')).toBe(42); expect(await count(db, 'questions')).toBe(20); expect(await count(db, 'video_resources')).toBe(4);
    expect((await db.first<{ n: number }>("SELECT COUNT(*) n FROM learning_content WHERE verification_status IN ('verified','published')"))!.n).toBe(0);
    expect((await loadState(db)).packs['chapter:gravitation'].version).toBe(1);
  });

  it('only downloads packs whose version moved; an unchanged server costs one cheap manifest call', async () => {
    const db = await fresh(); const r = new FakeRemote(); r.put('a', 1, small());
    await syncContent(db, r); r.log = [];
    const again = await syncContent(db, r);
    expect(again.upToDate).toBe(1); expect(again.applied).toEqual([]); expect(r.log).toEqual(['manifest']);
  });

  it('a new version adds only what is new and leaves everything else (including a student check) alone', async () => {
    const db = await fresh(); const r = new FakeRemote(); const v1 = gravitation(); r.put('chapter:gravitation', 1, v1);
    await syncContent(db, r);
    const q = (await db.first<{ id: string }>('SELECT id FROM questions LIMIT 1'))!.id; await reviewRepo.confirm(db, 'question', q);
    const v2 = gravitation();
    v2.questions.push({ type: 'integer', difficulty: 'main', stem: 'A brand-new published question: 3 + 4 = ?', numeric: 7, origin: 'generated', source: 'test' });
    v2.lessons.push({ topic: v2.topics[0], section: 'tips', level: 'main', language: 'en', body: 'A brand-new published tip.', source: 'test' });
    v2.videos.push({ topic: v2.topics[0], url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa', title: 'A brand-new video lesson', channel: 'Some Channel', purpose: 'concept', level: 'main', language: 'en', source: 'test' });
    r.put('chapter:gravitation', 2, v2);
    const res = await syncContent(db, r);
    expect(res.applied[0]).toMatchObject({ version: 2, added: 3 });
    expect(await count(db, 'questions')).toBe(21); expect(await count(db, 'learning_content')).toBe(43); expect(await count(db, 'video_resources')).toBe(5);
    expect((await db.first<{ s: string }>('SELECT verification_status s FROM questions WHERE id = ?', [q]))!.s).toBe('verified');
  });

  it('new questions reach the practice library once checked, and stay out until then', async () => {
    const db = await fresh(); const r = new FakeRemote(); const b = small() as Record<string, unknown>;
    b.questions = [{ topic: 'Escape velocity', type: 'single', difficulty: 'main', stem: 'Which is the escape velocity from Earth?', options: ['7.9 km/s', '11.2 km/s'], correct: ['B'], origin: 'generated', source: 'test' }];
    r.put('chapter:gravitation', 1, b); await syncContent(db, r);
    expect((await questionRepo.list(db, { chapterId: G })).length).toBe(0);
    const id = (await db.first<{ id: string }>('SELECT id FROM questions'))!.id; await reviewRepo.confirm(db, 'question', id);
    expect((await questionRepo.list(db, { chapterId: G })).map((x) => x.stem)).toEqual(['Which is the escape velocity from Earth?']);
  });

  it('applies a corrected lesson and withdraws the old text, unless someone already confirmed it', async () => {
    const db = await fresh(); const r = new FakeRemote(); const v1 = small(); r.put('p', 1, v1); await syncContent(db, r);
    const v2 = small(); v2.lessons[0].body = 'Corrected second version of the explanation.';
    r.put('p', 2, v2, { retired: [{ kind: 'lesson', topic: 'Escape velocity', section: 'explanation', level: 'main', language: 'en', body: v1.lessons[0].body, reason: 'Corrected' }] });
    const res = await syncContent(db, r);
    expect(res.applied[0].withdrawn).toBe(1);
    const live = await db.all<{ body: string }>('SELECT body FROM learning_content WHERE deleted_at IS NULL');
    expect(live.map((l) => l.body)).toEqual(['Corrected second version of the explanation.']);
    // confirmed text is never withdrawn
    const db2 = await fresh(); const r2 = new FakeRemote(); r2.put('p', 1, v1); await syncContent(db2, r2);
    const lid = (await db2.first<{ id: string }>('SELECT id FROM learning_content'))!.id; await reviewRepo.confirm(db2, 'lesson', lid);
    r2.put('p', 2, v2, { retired: [{ kind: 'lesson', topic: 'Escape velocity', section: 'explanation', level: 'main', language: 'en', body: v1.lessons[0].body, reason: 'Corrected' }] });
    expect((await syncContent(db2, r2)).applied[0].withdrawn).toBe(0);
    expect(await count(db2, 'learning_content')).toBe(2);
  });

  it('rejects a corrupted or invalid pack but still applies the good ones', async () => {
    const db = await fresh(); const r = new FakeRemote();
    r.put('good', 1, small());
    r.put('corrupt', 1, small(), { sha256: 'f'.repeat(64) });
    r.put('invalid', 1, { not: 'a bundle' });
    r.put('wrong-chapter', 1, { ...small(), chapter: 'Underwater Basket Weaving' });
    const res = await syncContent(db, r);
    expect(res.status).toBe('partial'); expect(res.applied.map((a) => a.id)).toEqual(['good']);
    expect(res.failed.map((f) => f.id).sort()).toEqual(['corrupt', 'invalid', 'wrong-chapter']);
    expect(res.failed.find((f) => f.id === 'corrupt')!.reason).toMatch(/checksum/);
    expect(Object.keys((await loadState(db)).packs)).toEqual(['good']);   // failed packs are retried next time
  });

  it('works offline: reports it, changes nothing, and keeps what was downloaded', async () => {
    const db = await fresh(); const r = new FakeRemote(); r.put('chapter:gravitation', 1, gravitation()); await syncContent(db, r);
    const before = await count(db, 'learning_content'); r.offline = true;
    const res = await syncContent(db, r);
    expect(res.status).toBe('offline'); expect(res.message).toMatch(/internet/i);
    expect(await count(db, 'learning_content')).toBe(before);
    expect((await loadState(db)).lastSuccessAt).not.toBeNull();     // the earlier success is remembered
    expect((await loadState(db)).lastAttemptAt).toBe(res.at);
  });

  it('a pack withdrawn by the publisher is reported, and the local copy is kept', async () => {
    const db = await fresh(); const r = new FakeRemote(); r.put('p', 1, small()); await syncContent(db, r);
    r.put('p', 1, small(), { deleted: true });
    const res = await syncContent(db, r);
    expect(res.withdrawnByPublisher).toEqual(['p']); expect(await count(db, 'learning_content')).toBe(1);
  });

  it('skips packs that need a newer app, and reports what is waiting', async () => {
    const db = await fresh(); const r = new FakeRemote(); r.put('p', 1, small(), { minAppVersion: '2.0.0' });
    const res = await syncContent(db, r, '1.0.0');
    expect(res.skipped[0]).toMatchObject({ id: 'p', reason: expect.stringMatching(/2\.0\.0/) }); expect(await count(db, 'learning_content')).toBe(0);
    expect(pendingPacks(await r.manifest(), await loadState(db)).map((m) => m.id)).toEqual(['p']);
    expect(versionAtLeast('1.10.0', '1.9.9')).toBe(true); expect(versionAtLeast('1.0', '1.0.1')).toBe(false);
  });

  it('video links in a pack are validated like any other import', async () => {
    const db = await fresh(); const r = new FakeRemote(); const b = small() as Record<string, unknown>;
    b.videos = [{ topic: 'Escape velocity', url: 'https://www.youtube.com/results?search_query=gravity', title: 'Search page', channel: 'Nobody', purpose: 'concept', level: 'main', language: 'en' }];
    r.put('p', 1, b); const res = await syncContent(db, r);
    expect(res.applied[0].warnings.join(' ')).toMatch(/specific YouTube/); expect((await videoRepo.forChapter(db, G)).length).toBe(0);
  });
});

describe('roadmap packs', () => {
  const node = (key: string, stage: number, prereqs: string[] = []) => ({ key, subject: 'math', area: 'Algebra', title: `Topic ${key}`, stage, prereqs });
  it('a valid roadmap replaces the built-in one; invalid ones are refused', async () => {
    const db = await fresh(); const r = new FakeRemote();
    r.put('roadmap', 1, { nodes: [node('aa', 1), node('bb', 2, ['aa'])] }, { kind: 'roadmap' });
    expect((await syncContent(db, r)).applied[0].updated).toBe(2);
    expect((await storedRoadmap(db))!.map((n) => n.key)).toEqual(['aa', 'bb']);
    r.put('roadmap', 2, { nodes: [node('aa', 1, ['bb']), node('bb', 2, ['aa'])] }, { kind: 'roadmap' });
    const bad = await syncContent(db, r);
    expect(bad.failed[0].reason).toMatch(/not safe/); expect((await storedRoadmap(db))!.map((n) => n.key)).toEqual(['aa', 'bb']);   // the good one stays
    r.put('roadmap', 3, { nodes: [node('aa', 3), node('bb', 2, ['aa'])] }, { kind: 'roadmap' });
    expect((await syncContent(db, r)).failed[0].reason).toMatch(/later stage/);
  });
});

describe('publisher script', () => {
  it('computes the same pack hashes as the app, so published packs pass the app\'s checksum', () => {
    const { execFileSync } = require('child_process') as typeof import('child_process');
    const out = execFileSync('node', ['scripts/publish-content.mjs', '--print-hashes'], { encoding: 'utf8' }).trim().split('\n');
    expect(out).toHaveLength(4);
    for (const line of out) {
      const [id, hash] = line.split(' ');
      const file = require(`../../content/${id.replace('chapter:', '')}.json`);
      expect(hash).toBe(packHash(file));
    }
  });
});
