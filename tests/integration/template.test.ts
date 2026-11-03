/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { examRepo } from '../../src/database/repositories/exams';
import { IDS, seedInitialData } from '../../src/database/seed';
import { examMaxMarks, scoreExam, validatePaper } from '../../src/features/exam-engine/scoring';
import { advancedSampleConfig } from '../../src/features/exam-engine/templates';
import type { ExamConfig } from '../../src/features/exam-engine/types';
import { assemblePaper, BankQuestion, buildTemplatePaper, shrinkToAvailable } from '../../src/features/practice/quiz';
import { memoryDb } from '../unit/sqlite-harness';

async function fresh() { const db = memoryDb(); await migrate(db); await seedInitialData(db); return db; }
const section = (id: string, over: Partial<ExamConfig['sections'][number]> = {}): ExamConfig['sections'][number] => ({
  id, name: `Sec ${id}`, subject: 'physics', questionType: 'single', questionCount: 4, attemptLimit: null,
  rule: { correct: 4, incorrect: -1, unanswered: 0, partialPerCorrectOption: null }, ...over,
});
const cfg = (sections: ExamConfig['sections'], over: Partial<ExamConfig> = {}): ExamConfig => ({ name: 'Main-style (my pattern)', style: 'main', durationMinutes: 180, negativeMarkingEnabled: true, sections, ...over });

describe('editing an exam pattern', () => {
  it('starts with no sections for Main-style (nothing is invented) and 12 for the Advanced sample', async () => {
    const db = await fresh();
    const t = await examRepo.templates(db);
    expect(t.map((x) => [x.style, x.sections, x.verification])).toEqual([['advanced', 12, 'needs_review'], ['main', 0, 'draft']]);
  });

  it('saves a pattern and reads it back exactly, including negative marking and partial credit', async () => {
    const db = await fresh();
    const mainId = IDS.tplMain;
    const c = cfg([section('p1'), section('m1', { subject: 'math', questionType: 'multi', questionCount: 3, rule: { correct: 4, incorrect: -2, unanswered: 0, partialPerCorrectOption: 1 } }),
      section('c1', { subject: 'chemistry', questionType: 'integer', questionCount: 5, attemptLimit: 3, rule: { correct: 4, incorrect: 0, unanswered: 0, partialPerCorrectOption: null } })]);
    await examRepo.saveTemplate(db, mainId, c, { verified: false, sourceNote: 'From the class test instructions' });
    const back = await examRepo.templateConfig(db, mainId);
    expect(back).toEqual(c);
    expect(examMaxMarks(back!)).toBe(16 + 12 + 12);
    expect((await examRepo.templates(db)).find((x) => x.id === mainId)).toMatchObject({ sections: 3, verification: 'needs_review', sourceNote: 'From the class test instructions' });
  });

  it('removing a section hides it, re-adding it restores it, and ids stay stable', async () => {
    const db = await fresh();
    await examRepo.saveTemplate(db, IDS.tplMain, cfg([section('a'), section('b')]), { verified: false });
    const ids1 = (await db.all<{ id: string }>('SELECT id FROM exam_sections WHERE template_id = ? ORDER BY section_key', [IDS.tplMain])).map((r) => r.id);
    await examRepo.saveTemplate(db, IDS.tplMain, cfg([section('a')]), { verified: false });
    expect((await examRepo.templateConfig(db, IDS.tplMain))!.sections.map((s) => s.id)).toEqual(['a']);
    await examRepo.saveTemplate(db, IDS.tplMain, cfg([section('a'), section('b')]), { verified: true });
    expect((await examRepo.templateConfig(db, IDS.tplMain))!.sections.map((s) => s.id)).toEqual(['a', 'b']);
    expect((await db.all<{ id: string }>('SELECT id FROM exam_sections WHERE template_id = ? ORDER BY section_key', [IDS.tplMain])).map((r) => r.id)).toEqual(ids1);
    expect((await examRepo.templates(db)).find((x) => x.id === IDS.tplMain)!.verification).toBe('verified');
  });

  it('can edit the seeded Advanced sample in place, reusing its section ids', async () => {
    const db = await fresh();
    const adv = (await examRepo.templateConfig(db, IDS.tplAdv))!;
    const before = (await db.first<{ id: string }>("SELECT id FROM exam_sections WHERE template_id = ? AND section_key = 'math-1'", [IDS.tplAdv]))!.id;
    adv.sections[0].rule.correct = 5;
    await examRepo.saveTemplate(db, IDS.tplAdv, adv, { verified: true });
    expect((await examRepo.templateConfig(db, IDS.tplAdv))!.sections[0].rule.correct).toBe(5);
    expect((await db.first<{ id: string }>("SELECT id FROM exam_sections WHERE template_id = ? AND section_key = 'math-1'", [IDS.tplAdv]))!.id).toBe(before);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM scoring_rules'))!.n).toBe(12);
  });

  it('rejects invalid patterns without changing anything, and queues valid saves for sync', async () => {
    const db = await fresh();
    await expect(examRepo.saveTemplate(db, IDS.tplMain, cfg([section('a'), section('a')]), { verified: false })).rejects.toThrow();
    await expect(examRepo.saveTemplate(db, IDS.tplMain, cfg([section('a', { questionCount: 0 })]), { verified: false })).rejects.toThrow();
    await expect(examRepo.saveTemplate(db, IDS.tplMain, cfg([section('a', { rule: { correct: 4, incorrect: 1, unanswered: 0, partialPerCorrectOption: null } })]), { verified: false })).rejects.toThrow();
    expect((await examRepo.templates(db)).find((x) => x.id === IDS.tplMain)!.sections).toBe(0);
    await db.run('DELETE FROM sync_outbox');
    await examRepo.saveTemplate(db, IDS.tplMain, cfg([section('a')]), { verified: false });
    const q = (await db.all<{ table_name: string }>('SELECT DISTINCT table_name FROM sync_outbox ORDER BY table_name')).map((r) => r.table_name);
    expect(q).toEqual(['exam_sections', 'exam_templates', 'scoring_rules']);
  });
});

describe('building a mock paper from a pattern', () => {
  const bank = (n: number, over: Partial<BankQuestion> = {}): BankQuestion[] =>
    Array.from({ length: n }, (_, i) => ({ id: `q${over.subject ?? 'physics'}${over.type ?? 'single'}${i}`, chapterId: 'c', subject: 'physics', type: 'single', difficulty: (['foundation', 'main', 'advanced'] as const)[i % 3], verified: true, ...over }));
  const keysFor = (qs: BankQuestion[]) => Object.fromEntries(qs.map((q) => [q.id, q.type === 'integer' ? { numeric: 1 } : { correct: ['A'] }]));

  it('fills each section with matching verified questions and never repeats one', () => {
    const c = cfg([section('p1', { questionCount: 3 }), section('p2', { questionCount: 3 })]);
    const { picked, shortfalls } = buildTemplatePaper(c, bank(8));
    expect(shortfalls).toEqual([]);
    const all = [...picked.p1, ...picked.p2].map((q) => q.id);
    expect(new Set(all).size).toBe(6);
  });
  it('matches subject and type, and ignores unverified questions', () => {
    const c = cfg([section('m1', { subject: 'math', questionType: 'integer', questionCount: 2 })]);
    const b = [...bank(5), ...bank(3, { subject: 'math', type: 'integer' }), ...bank(4, { subject: 'math', type: 'integer', verified: false }).map((q) => ({ ...q, id: q.id + 'u' }))];
    const { picked } = buildTemplatePaper(c, b);
    expect(picked.m1).toHaveLength(2);
    expect(picked.m1.every((q) => q.subject === 'math' && q.type === 'integer' && q.verified)).toBe(true);
  });
  it('reports exactly what is missing instead of inventing questions', () => {
    const c = cfg([section('p1', { questionCount: 4 }), section('c1', { subject: 'chemistry', questionCount: 2, name: 'Chemistry single' })]);
    const { shortfalls } = buildTemplatePaper(c, bank(3));
    expect(shortfalls).toEqual([{ sectionId: 'p1', name: 'Sec p1', need: 4, have: 3 }, { sectionId: 'c1', name: 'Chemistry single', need: 2, have: 0 }]);
  });
  it('a shorter paper keeps the marking and scores correctly against its own maximum', () => {
    const c = cfg([section('p1', { questionCount: 4 }), section('c1', { subject: 'chemistry', questionCount: 2 })]);
    const b = bank(3);
    const { picked } = buildTemplatePaper(c, b);
    const short = shrinkToAvailable(c, picked);
    expect(short.name).toMatch(/shorter paper/);
    expect(short.sections.map((s) => [s.id, s.questionCount])).toEqual([['p1', 3]]);
    const paper = assemblePaper(short, picked, keysFor(b));
    expect(validatePaper(short, paper.questions)).toEqual([]);
    const r = scoreExam({ config: short, questions: paper.questions, responses: { [paper.questions[0].id]: { selected: ['A'] }, [paper.questions[1].id]: { selected: ['B'] } } });
    expect([r.totalMarks, r.maxMarks]).toEqual([3, 12]);
  });
  it('a full paper from the Advanced sample is complete when the bank is big enough', () => {
    const adv = advancedSampleConfig();
    const b = (['math', 'physics', 'chemistry'] as const).flatMap((subject) => (['single', 'multi', 'integer', 'matching'] as const).flatMap((type) => bank(8, { subject, type })));
    const { picked, shortfalls } = buildTemplatePaper(adv, b);
    expect(shortfalls).toEqual([]);
    const paper = assemblePaper(adv, picked, keysFor(b));
    expect(paper.questions).toHaveLength(51);
    expect(validatePaper(adv, paper.questions)).toEqual([]);
    expect(examMaxMarks(adv)).toBe(180);
  });
  it('refuses to assemble a paper with a missing answer key', () => {
    const c = cfg([section('p1', { questionCount: 1 })]);
    const { picked } = buildTemplatePaper(c, bank(2));
    expect(() => assemblePaper(c, picked, {})).toThrow();
  });
});
