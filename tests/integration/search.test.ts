/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { contentRepo } from '../../src/database/repositories/content';
import { notesRepo } from '../../src/database/repositories/notes';
import { questionRepo } from '../../src/database/repositories/questions';
import { searchRepo } from '../../src/database/repositories/search';
import { videoRepo } from '../../src/database/repositories/videos';
import { IDS, seedInitialData } from '../../src/database/seed';
import { parseQuery } from '../../src/features/search/query';
import { memoryDb } from '../unit/sqlite-harness';

const G = IDS.chapter.gravitation, B = IDS.chapter.binomial;
async function lib() {
  const db = memoryDb(); await migrate(db); await seedInitialData(db);
  const gpe = await contentRepo.ensureTopic(db, G, 'Gravitational potential energy');
  await contentRepo.addLesson(db, { chapterId: G, topicId: gpe.id, section: 'explanation', body: 'Gravitational potential energy is the work done to bring a mass from infinity: $-\\frac{GMm}{r}$.', verified: true });
  await contentRepo.addFormula(db, { chapterId: B, name: 'Binomial coefficients', latex: '\\binom{n}{r}', explanation: 'Number of ways to choose r from n.', verified: true });
  await videoRepo.add(db, { chapterId: B, url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Binomial coefficients explained', channel: 'Some Teacher', purpose: 'concept' });
  await notesRepo.add(db, G, 'Remember escape velocity uses the same potential.', { topicId: gpe.id });
  await questionRepo.add(db, { chapterId: B, type: 'single', stem: 'Coefficient of x^2 in (1+x)^5?', options: ['5', '10', '15', '20'], correct: ['B'], verified: true, explanation: 'SECRETEXPLANATION' });
  await questionRepo.add(db, { chapterId: B, type: 'single', stem: 'Binomial PYQ stem about expansion', options: ['1', '2'], correct: ['A'], verified: true, origin: 'official', examCategory: 'jee_main', examYear: 2022, citation: 'JEE Main 2022 Q4' });
  await questionRepo.add(db, { chapterId: B, type: 'single', stem: 'Unconfirmed binomial question', options: ['1', '2'], correct: ['A'], verified: false });
  return db;
}

describe('query parsing', () => {
  it('turns intent words into result kinds and drops filler', () => {
    expect(parseQuery('JEE Advanced PYQs on functions')).toEqual({ terms: ['functions'], kinds: ['pyq'] });
    expect(parseQuery('Videos explaining inverse trigonometric functions')).toEqual({ terms: ['inverse', 'trigonometric', 'functions'], kinds: ['video'] });
    expect(parseQuery('Chemical kinetics numericals')).toEqual({ terms: ['chemical', 'kinetics'], kinds: ['question', 'pyq'] });
  });
});

describe('library search', () => {
  it('finds topics, lessons and notes with subject and topic context', async () => {
    const hits = await searchRepo.search(await lib(), 'gravitational potential energy');
    const kinds = hits.map((h) => h.kind);
    expect(kinds).toEqual(expect.arrayContaining(['topic', 'lesson']));
    const topic = hits.find((h) => h.kind === 'topic')!;
    expect([topic.subject, topic.chapterTitle, topic.topicTitle]).toEqual(['physics', 'Gravitation', 'Gravitational potential energy']);
    expect(hits[0].kind).toBe('topic');
  });
  it('finds formulas, videos and notes, and narrows by intent word', async () => {
    const db = await lib();
    const all = await searchRepo.search(db, 'binomial coefficients');
    expect(all.map((h) => h.kind)).toEqual(expect.arrayContaining(['formula', 'video']));
    expect((await searchRepo.search(db, 'videos binomial coefficients')).every((h) => h.kind === 'video')).toBe(true);
    expect((await searchRepo.search(db, 'notes escape velocity')).map((h) => h.kind)).toEqual(['note']);
  });
  it('PYQ search returns only traceable PYQs, and plain questions stay plain', async () => {
    const db = await lib();
    const pyq = await searchRepo.search(db, 'PYQs on binomial');
    expect(pyq.map((h) => h.kind)).toEqual(['pyq']);
    expect(pyq[0].title).toMatch(/Binomial PYQ stem/);
    const qs = await searchRepo.search(db, 'questions coefficient');
    expect(qs.map((h) => h.kind)).toEqual(['question']);
  });
  it('never searches or returns answer keys, and skips unconfirmed questions', async () => {
    const db = await lib();
    expect(await searchRepo.search(db, 'SECRETEXPLANATION')).toEqual([]);
    const hits = await searchRepo.search(db, 'unconfirmed binomial');
    expect(hits.some((h) => h.kind === 'question' || h.kind === 'pyq')).toBe(false);
  });
  it('requires every term, handles plurals, wildcards and paging', async () => {
    const db = await lib();
    expect(await searchRepo.search(db, 'binomial zebra')).toEqual([]);
    expect((await searchRepo.search(db, 'coefficient')).length).toBeGreaterThan(0);
    expect(await searchRepo.search(db, '100%')).toEqual([]);
    expect(await searchRepo.search(db, '')).toEqual([]);
    const page1 = await searchRepo.search(db, 'binomial', { limit: 2 });
    const page2 = await searchRepo.search(db, 'binomial', { limit: 2, offset: 2 });
    expect(page1).toHaveLength(2);
    expect(page2.every((h) => !page1.some((p) => p.id === h.id && p.kind === h.kind))).toBe(true);
  });
});
