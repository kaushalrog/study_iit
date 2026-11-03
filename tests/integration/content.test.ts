/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { contentRepo } from '../../src/database/repositories/content';
import { questionRepo } from '../../src/database/repositories/questions';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { IDS, seedInitialData } from '../../src/database/seed';
import { IMPORT_EXAMPLE, parseImport } from '../../src/features/syllabus/importBundle';
import { memoryDb } from '../unit/sqlite-harness';

const G = IDS.chapter.gravitation;
async function fresh() { const db = memoryDb(); await migrate(db); await seedInitialData(db); return db; }

describe('student-authored lessons, topics and formulas', () => {
  it('adds topics once, case-insensitively, in order', async () => {
    const db = await fresh();
    const a = await contentRepo.ensureTopic(db, G, "Newton's law of gravitation");
    const b = await contentRepo.ensureTopic(db, G, "  newton's LAW of gravitation ");
    await contentRepo.ensureTopic(db, G, 'Escape velocity');
    expect(a.created).toBe(true); expect(b).toEqual({ id: a.id, created: false });
    expect((await contentRepo.topics(db, G)).map((t) => t.title)).toEqual(["Newton's law of gravitation", 'Escape velocity']);
    await expect(contentRepo.ensureTopic(db, G, '  ')).rejects.toThrow();
  });

  it('stores lessons in teaching order per language and labels unverified ones', async () => {
    const db = await fresh();
    await contentRepo.addLesson(db, { chapterId: G, section: 'summary', body: 'Short revision.' });
    await contentRepo.addLesson(db, { chapterId: G, section: 'introduction', body: 'What gravity is.', verified: true });
    await contentRepo.addLesson(db, { chapterId: G, section: 'explanation', language: 'te', body: 'గురుత్వాకర్షణ అంటే…' });
    const en = await contentRepo.lessons(db, G, 'en');
    expect(en.map((l) => [l.section, l.verification])).toEqual([['introduction', 'verified'], ['summary', 'needs_review']]);
    expect((await contentRepo.lessons(db, G, 'te'))[0].body).toContain('గురుత్వాకర్షణ');
    expect((await syllabusRepo.chapter(db, G))!.lessonCount).toBe(3);
  });

  it('edits and removes lessons, and rejects empty text', async () => {
    const db = await fresh();
    const id = await contentRepo.addLesson(db, { chapterId: G, section: 'tips', body: 'Draw the diagram first.' });
    await contentRepo.updateLesson(db, id, { body: 'Always draw the diagram first.', verified: true });
    expect((await contentRepo.lessons(db, G, 'en'))[0]).toMatchObject({ body: 'Always draw the diagram first.', verification: 'verified' });
    await expect(contentRepo.updateLesson(db, id, { body: ' ' })).rejects.toThrow();
    await contentRepo.removeLesson(db, id);
    expect(await contentRepo.lessons(db, G, 'en')).toEqual([]);
    await expect(contentRepo.addLesson(db, { chapterId: G, section: 'tips', body: '' })).rejects.toThrow();
  });

  it('stores formulas with variables and queues lessons and formulas for sync', async () => {
    const db = await fresh();
    await contentRepo.addFormula(db, { chapterId: G, name: 'Law of gravitation', latex: 'F = G \\frac{m_1 m_2}{r^2}', variables: [{ symbol: 'G', meaning: 'gravitational constant', unit: 'N m²/kg²' }], verified: true });
    await contentRepo.addLesson(db, { chapterId: G, section: 'explanation', body: 'Masses attract.' });
    const [f] = await contentRepo.formulas(db, G);
    expect(f).toMatchObject({ name: 'Law of gravitation', verification: 'verified' });
    expect(f.variables[0].symbol).toBe('G');
    const queued = (await db.all<{ table_name: string }>('SELECT table_name FROM sync_outbox')).map((r) => r.table_name).sort();
    expect(queued).toEqual(['formulas', 'learning_content']);
    await expect(contentRepo.addFormula(db, { chapterId: G, name: 'x', latex: '' })).rejects.toThrow();
  });
});

describe('bulk import', () => {
  const bundle = JSON.parse(IMPORT_EXAMPLE);

  it('the documented example parses cleanly', () => {
    const r = parseImport(IMPORT_EXAMPLE);
    expect(r.issues).toEqual([]);
    expect(r.bundles[0]).toMatchObject({ chapter: 'Gravitation' });
    expect([r.bundles[0].topics.length, r.bundles[0].lessons.length, r.bundles[0].formulas.length, r.bundles[0].questions.length]).toEqual([2, 1, 1, 2]);
  });
  it('accepts fenced code blocks, arrays and { bundles: [] }', () => {
    expect(parseImport('```json\n' + IMPORT_EXAMPLE + '\n```').bundles).toHaveLength(1);
    expect(parseImport(JSON.stringify([bundle, bundle])).bundles).toHaveLength(2);
    expect(parseImport(JSON.stringify({ bundles: [bundle] })).bundles).toHaveLength(1);
  });
  it('reports unreadable JSON and a missing chapter', () => {
    expect(parseImport('{ nope').unreadable).toBe(true);
    const r = parseImport('{"lessons": []}');
    expect(r.bundles).toHaveLength(0);
    expect(r.issues[0].message).toMatch(/chapter/i);
  });
  it('skips only the bad items and says exactly which', () => {
    const r = parseImport(JSON.stringify({ chapter: 'Gravitation',
      lessons: [{ section: 'nonsense', body: 'x' }, { section: 'summary', body: 'Good one.' }],
      formulas: [{ name: 'F', latex: '' }],
      questions: [{ stem: 'Pick one?', options: ['a', 'b'], correct: ['C'] }, { stem: 'Valid question?', options: ['a', 'b'], correct: ['A'] }, { type: 'integer', stem: 'No answer?' }] }));
    expect(r.bundles[0].lessons).toHaveLength(1);
    expect(r.bundles[0].questions).toHaveLength(1);
    expect(r.issues.map((i) => i.where)).toEqual(expect.arrayContaining(['File · lesson 1', 'File · formula 1', 'File · question 1', 'File · question 3']));
  });

  it('imports everything, creating topics from names, and a second import changes nothing', async () => {
    const db = await fresh();
    const parsed = parseImport(IMPORT_EXAMPLE).bundles[0];
    const first = await contentRepo.importBundle(db, G, parsed, true);
    expect(first.added).toEqual({ topics: 2, lessons: 1, formulas: 1, questions: 2 });
    const second = await contentRepo.importBundle(db, G, parsed, true);
    expect(second.added).toEqual({ topics: 0, lessons: 0, formulas: 0, questions: 0 });
    expect(second.skipped).toMatchObject({ lessons: 1, formulas: 1, questions: 2 });
    for (const [t, n] of [['topics', 2], ['learning_content', 1], ['formulas', 1], ['questions', 2], ['question_solutions', 2]] as const) {
      expect([t, (await db.first<{ n: number }>(`SELECT COUNT(*) n FROM ${t}`))!.n]).toEqual([t, n]);
    }
    const [topic] = await contentRepo.topics(db, G);
    expect((await contentRepo.lessons(db, G, 'en'))[0].topicId).toBe(topic.id);
  });

  it('only puts questions into the practice bank when the student confirms she checked them', async () => {
    const db = await fresh();
    const parsed = parseImport(IMPORT_EXAMPLE).bundles[0];
    await contentRepo.importBundle(db, G, parsed, false);
    expect(await questionRepo.list(db)).toHaveLength(0);
    expect(await questionRepo.unverifiedCount(db)).toBe(2);
    expect((await contentRepo.lessons(db, G, 'en'))[0].verification).toBe('needs_review');
    // Confirming later (a new import of the same material) does not silently flip existing items.
    const again = await contentRepo.importBundle(db, G, parsed, true);
    expect(again.added.questions).toBe(0);
  });

  it('keeps answer keys out of question lists, and rolls back a failed import atomically', async () => {
    const db = await fresh();
    const parsed = parseImport(IMPORT_EXAMPLE).bundles[0];
    await contentRepo.importBundle(db, G, parsed, true);
    expect(JSON.stringify(await questionRepo.list(db))).not.toMatch(/"correct"/);
    const db2 = await fresh();
    await expect(contentRepo.importBundle(db2, 'no-such-chapter', parsed, true)).rejects.toThrow(/Chapter not found/);
    expect((await db2.first<{ n: number }>('SELECT COUNT(*) n FROM topics'))!.n).toBe(0);
  });

  it('resolves chapters by name, tolerating case and extra words', async () => {
    const db = await fresh();
    expect((await contentRepo.resolveChapter(db, 'gravitation'))!.id).toBe(G);
    expect((await contentRepo.resolveChapter(db, 'Physics: Gravitation (complete)'))!.id).toBe(G);
    expect((await contentRepo.resolveChapter(db, 'Chemical kinetics'))!.id).toBe(IDS.chapter.kinetics);
    expect(await contentRepo.resolveChapter(db, 'Thermodynamics')).toBeNull();
  });
});
