/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { coverageRepo } from '../../src/database/repositories/coverage';
import { contentRepo } from '../../src/database/repositories/content';
import { questionRepo } from '../../src/database/repositories/questions';
import { videoRepo } from '../../src/database/repositories/videos';
import { IDS, seedInitialData } from '../../src/database/seed';
import { classifyProvenance, provenanceIssues } from '../../src/features/content/provenance';
import { parseYoutube } from '../../src/features/content/youtube';
import { itemsCovered, topicStatus, emptyCounts } from '../../src/features/coverage/coverage';
import { memoryDb } from '../unit/sqlite-harness';

const G = IDS.chapter.gravitation;
async function fresh() { const db = memoryDb(); await migrate(db); await seedInitialData(db); return db; }
const q = (over: object = {}) => ({ chapterId: G, type: 'single' as const, stem: 'What is g?', options: ['9.8', '10', '8', '9'], correct: ['A'], verified: true, ...over });

describe('YouTube links', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s', 'video', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?si=abc', 'video', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'video', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'video', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/playlist?list=PLabcdefghij123456', 'playlist', 'PLabcdefghij123456'],
  ])('accepts %s', (url, kind, id) => expect(parseYoutube(url)).toMatchObject({ kind, id }));
  it.each([
    'https://www.youtube.com/results?search_query=gravitation', 'https://www.youtube.com/', 'https://www.youtube.com/@somechannel', 'https://www.youtube.com/channel/UC123',
    'https://www.youtube.com/watch?v=short', 'https://evil.com/watch?v=dQw4w9WgXcQ', 'javascript:alert(1)', 'not a url', 'https://www.youtube.com.evil.com/watch?v=dQw4w9WgXcQ',
  ])('rejects %s', (url) => expect(parseYoutube(url)).toBeNull());
});

describe('provenance', () => {
  it('only a traceable official question is a PYQ', () => {
    expect(classifyProvenance({ origin: 'official', examCategory: 'jee_main', examYear: 2023, citation: 'JEE Main 2023, 25 Jan shift 1, Q12' })).toBe('pyq');
    expect(classifyProvenance({ origin: 'official' })).toBe('official_unsourced');
    expect(classifyProvenance({ origin: 'official', examCategory: 'jee_main', examYear: 2023, citation: '  ' })).toBe('official_unsourced');
    expect(classifyProvenance({ origin: 'official', examCategory: 'jee_main', examYear: 2999, citation: 'x' })).toBe('official_unsourced');
    expect(classifyProvenance({ origin: 'generated', examCategory: 'jee_main', examYear: 2023, citation: 'x' })).toBe('generated');
    expect(classifyProvenance({ origin: 'coaching', examCategory: 'jee_main', examYear: 2023, citation: 'x' })).toBe('coaching');
    expect(provenanceIssues({ origin: 'official' })).toHaveLength(3);
    expect(provenanceIssues({ origin: 'coaching' })).toEqual([]);
  });
  it('the repository refuses an untraceable "official" question and stores a traceable one', async () => {
    const db = await fresh();
    await expect(questionRepo.add(db, q({ origin: 'official' }))).rejects.toThrow();
    const id = await questionRepo.add(db, q({ origin: 'official', examCategory: 'jee_advanced', examYear: 2022, examSession: 'Paper 1', citation: 'JEE Adv 2022 P1 Q5', license: 'open' }));
    const r = (await db.first<{ exam_category: string; exam_year: number; citation: string; license: string }>('SELECT * FROM questions WHERE id = ?', [id]))!;
    expect([r.exam_category, r.exam_year, r.citation, r.license]).toEqual(['jee_advanced', 2022, 'JEE Adv 2022 P1 Q5', 'open']);
  });
});

describe('video catalogue', () => {
  const v = (over: object = {}) => ({ chapterId: G, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Gravitation basics', channel: 'Some Teacher', purpose: 'concept' as const, ...over });
  it('rejects search pages and stores a canonical link', async () => {
    const db = await fresh();
    await expect(videoRepo.add(db, v({ url: 'https://www.youtube.com/results?search_query=gravity' }))).rejects.toThrow(/specific YouTube/);
    await videoRepo.add(db, v({ url: 'https://youtu.be/dQw4w9WgXcQ?si=zzz' }));
    const [row] = await videoRepo.forChapter(db, G);
    expect([row.url, row.youtubeId, row.kind, row.verification, row.linkCheckedAt]).toEqual(['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'video', 'needs_review', null]);
  });
  it('adding the same link to the same place updates instead of duplicating', async () => {
    const db = await fresh();
    await videoRepo.add(db, v()); await videoRepo.add(db, v({ title: 'Gravitation basics (better title)' }));
    const rows = await videoRepo.forChapter(db, G);
    expect(rows).toHaveLength(1); expect(rows[0].title).toMatch(/better/);
  });
  it('verification is a person\'s statement and stamps the check date; watching never touches mastery', async () => {
    const db = await fresh();
    const id = await videoRepo.add(db, v());
    await videoRepo.setVerified(db, id, true);
    let [row] = await videoRepo.forChapter(db, G);
    expect(row.verification).toBe('verified'); expect(row.linkCheckedAt).toBeTruthy();
    await videoRepo.markWatched(db, id, true); await videoRepo.setSaved(db, id, true); await videoRepo.setNote(db, id, ' key idea ');
    [row] = await videoRepo.forChapter(db, G);
    expect([!!row.watchedAt, row.saved, row.note]).toEqual([true, true, 'key idea']);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM topic_mastery'))!.n).toBe(0);
    expect((await videoRepo.saved(db))).toHaveLength(1);
  });
  it('syncs: writes are queued for the outbox', async () => {
    const db = await fresh(); await db.run('DELETE FROM sync_outbox');
    await videoRepo.add(db, v());
    expect((await db.all<{ table_name: string }>('SELECT table_name FROM sync_outbox')).map((r) => r.table_name)).toEqual(['video_resources']);
  });
});

describe('coverage report', () => {
  it('a fresh install reports everything missing, never complete', async () => {
    const db = await fresh();
    const rep = await coverageRepo.load(db);
    expect(rep).toHaveLength(4);
    expect(rep.every((c) => c.status === 'empty' && itemsCovered(c.counts) === 0)).toBe(true);
  });
  it('counts verified and unverified separately, and PYQs apart from practice', async () => {
    const db = await fresh();
    const t = await contentRepo.ensureTopic(db, G, 'Gravitational potential energy');
    await contentRepo.addLesson(db, { chapterId: G, topicId: t.id, section: 'explanation', body: 'Energy of a mass in a field.', verified: true });
    await contentRepo.addLesson(db, { chapterId: G, topicId: t.id, section: 'example', body: 'Worked example text.', verified: false });
    await videoRepo.add(db, { chapterId: G, topicId: t.id, url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Potential energy', channel: 'Some Teacher', purpose: 'concept' });
    await questionRepo.add(db, q({ topicId: undefined }));
    await questionRepo.add(db, q({ stem: 'Second question here', origin: 'official', examCategory: 'jee_main', examYear: 2021, citation: 'JEE Main 2021 Q1' }));
    await questionRepo.add(db, q({ stem: 'Coaching one here', origin: 'coaching', verified: false }));
    const g = (await coverageRepo.load(db)).find((c) => c.chapterId === G)!;
    expect(g.counts.explanation).toEqual({ verified: 1, unverified: 0 });
    expect(g.counts.examples).toEqual({ verified: 0, unverified: 1 });
    expect(g.counts.videos).toEqual({ verified: 0, unverified: 1 });
    expect(g.counts.pyq).toEqual({ verified: 1, unverified: 0 });
    expect(g.counts.practice).toEqual({ verified: 1, unverified: 1 });
    expect(g.topics[0].counts.explanation.verified).toBe(1);
    expect(g.status).toBe('partial');
  });
  it('unverified material never makes a topic complete', () => {
    const c = emptyCounts();
    for (const k of Object.keys(c) as (keyof typeof c)[]) c[k] = { verified: 0, unverified: 5 };
    expect(topicStatus(c)).toBe('unverified');
    for (const k of Object.keys(c) as (keyof typeof c)[]) c[k] = { verified: 1, unverified: 0 };
    expect(topicStatus(c)).toBe('complete');
    c.videos = { verified: 0, unverified: 1 };
    expect(topicStatus(c)).toBe('partial');
  });
});
