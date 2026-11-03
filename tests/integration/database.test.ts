/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { attemptIdFor, attemptRepo, UUID_RE } from '../../src/database/repositories/attempts';
import { examRepo } from '../../src/database/repositories/exams';
import { mistakeRepo } from '../../src/database/repositories/mistakes';
import { mockRepo } from '../../src/database/repositories/mocks';
import { questionRepo } from '../../src/database/repositories/questions';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { IDS, seedInitialData } from '../../src/database/seed';
import { loadHomeData } from '../../src/features/dashboard/homeData';
import { examMaxMarks, scoreExam } from '../../src/features/exam-engine/scoring';
import { answer, finish, goTo, startSession } from '../../src/features/exam-engine/session';
import { buildCustomExam, selectQuestions } from '../../src/features/practice/quiz';
import { pushOutbox, RemoteWriter } from '../../src/services/sync/outbox';
import { memoryDb } from '../unit/sqlite-harness';

async function fresh() {
  const db = memoryDb();
  await migrate(db);
  await seedInitialData(db);
  return db;
}

describe('migrations and seed', () => {
  it('is idempotent', async () => {
    const db = await fresh();
    expect(await migrate(db)).toBe(5);
    await db.run("DELETE FROM app_meta WHERE key='seed_v1'");
    await seedInitialData(db);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM chapters'))!.n).toBe(4);
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM exams'))!.n).toBe(2);
  });
  it('registers the four chapters and the two exam dates, with no invented results', async () => {
    const db = await fresh();
    const ch = await syllabusRepo.chapters(db);
    expect(ch.map((c) => c.title)).toEqual(['Inverse Trigonometry', 'Binomial Theorem', 'Gravitation', 'Chemical Kinetics']);
    expect((await examRepo.list(db)).map((e) => [e.style, e.examDate])).toEqual([['main', '2026-11-10'], ['advanced', '2026-11-11']]);
    for (const t of ['questions', 'question_attempts', 'mistake_entries', 'topic_mastery']) {
      expect((await db.first<{ n: number }>(`SELECT COUNT(*) n FROM ${t}`))!.n).toBe(0);
    }
    expect(await examRepo.history(db)).toEqual([]);
  });
  it('loads the advanced template into a valid 180-mark config; main has no invented sections', async () => {
    const db = await fresh();
    const adv = await examRepo.templateConfig(db, IDS.tplAdv);
    expect(examMaxMarks(adv!)).toBe(180);
    expect((await examRepo.templateConfig(db, IDS.tplMain))!.sections).toEqual([]);
  });
  it('refuses to set a topic to mastered by hand', async () => {
    const db = await fresh();
    await expect(syllabusRepo.setTopicStatus(db, 'x', 'mastered')).rejects.toThrow();
  });
});

describe('error book', () => {
  const base = { subject: 'physics' as const, chapterId: IDS.chapter.gravitation, questionText: 'Why does g change with height?', category: 'conceptual' as const };
  it('saves a mistake with a revision due the next day, and queues it for sync', async () => {
    const db = await fresh();
    await mistakeRepo.add(db, base, '2026-11-01');
    const due = await mistakeRepo.due(db, '2026-11-02');
    expect(due).toHaveLength(1);
    expect(due[0].dueOn).toBe('2026-11-02');
    expect(await mistakeRepo.due(db, '2026-11-01')).toHaveLength(0);
    const out = await db.all<{ table_name: string }>('SELECT table_name FROM sync_outbox ORDER BY table_name');
    expect(out.map((o) => o.table_name)).toEqual(['mistake_entries', 'revision_schedule']);
  });
  it('rejects unconfirmed OCR text and empty questions', async () => {
    const db = await fresh();
    await expect(mistakeRepo.add(db, { ...base, ocrConfirmed: false }, '2026-11-01')).rejects.toThrow();
    await expect(mistakeRepo.add(db, { ...base, questionText: ' ' }, '2026-11-01')).rejects.toThrow();
  });
  it('reschedules after review and flags repeated failure', async () => {
    const db = await fresh();
    const id = await mistakeRepo.add(db, base, '2026-11-01');
    const a = await mistakeRepo.review(db, id, 'wrong', '2026-11-02');
    expect(a.dueOn).toBe('2026-11-03');
    const b = await mistakeRepo.review(db, id, 'wrong', '2026-11-03');
    expect(b.reviewConcept).toBe(true);
    expect((await mistakeRepo.list(db))[0].reviewConcept).toBe(true);
  });
  it('searches, filters and counts from stored records', async () => {
    const db = await fresh();
    await mistakeRepo.add(db, base, '2026-11-01');
    await mistakeRepo.add(db, { ...base, subject: 'chemistry', chapterId: IDS.chapter.kinetics, questionText: 'Order of reaction 100% sure', category: 'calculation' }, '2026-11-01');
    expect(await mistakeRepo.list(db, { chapterId: IDS.chapter.gravitation })).toHaveLength(1);
    expect(await mistakeRepo.list(db, { search: 'order of' })).toHaveLength(1);
    expect(await mistakeRepo.list(db, { search: '100%' })).toHaveLength(1); // % is escaped, not a wildcard
    expect(await mistakeRepo.list(db, { search: '%' })).toHaveLength(1);
    expect((await mistakeRepo.categoryCounts(db)).map((c) => c.n)).toEqual([1, 1]);
    expect(await mistakeRepo.overdueCount(db, '2026-11-05')).toBe(2);
  });
});

describe('manual exam results', () => {
  it('stores marks, keeps history, rejects marks above the maximum', async () => {
    const db = await fresh();
    await examRepo.saveManualResult(db, { examId: IDS.examMain, subjects: [
      { subject: 'math', marks: 60, maxMarks: 100 }, { subject: 'physics', marks: 30, maxMarks: 100 }] });
    const h = await examRepo.history(db);
    expect(h).toHaveLength(1);
    expect([h[0].total_score, h[0].max_score, h[0].entry_mode]).toEqual([90, 200, 'manual']);
    await expect(examRepo.saveManualResult(db, { examId: IDS.examMain, subjects: [{ subject: 'math', marks: 101, maxMarks: 100 }] })).rejects.toThrow();
  });
  it('re-entering a result does not duplicate subject rows', async () => {
    const db = await fresh();
    const r = { examId: IDS.examMain, subjects: [{ subject: 'math' as const, marks: 10, maxMarks: 100 }] };
    await examRepo.saveManualResult(db, r);
    await examRepo.saveManualResult(db, { ...r, subjects: [{ ...r.subjects[0], marks: 20 }] });
    const rows = await db.all<{ marks: number }>('SELECT marks FROM exam_subject_results');
    expect(rows).toEqual([{ marks: 20 }]);
  });
});

describe('mastery evidence', () => {
  async function addQuestion(db: Awaited<ReturnType<typeof fresh>>, id: string, status: string) {
    await db.run(`INSERT INTO questions (id, chapter_id, type, stem, verification_status) VALUES (?, ?, 'single', 'q', ?)`, [id, IDS.chapter.gravitation, status]);
  }
  it('counts only verified questions, and attempts are idempotent by id', async () => {
    const db = await fresh();
    await addQuestion(db, 'q-ver', 'verified');
    await addQuestion(db, 'q-gen', 'draft');
    const a = { questionId: 'q-ver', kind: 'practice' as const, outcome: 'correct' as const, marks: 3, timeMs: 1000 };
    await attemptRepo.record(db, { ...a, id: 'att-1' });
    await attemptRepo.record(db, { ...a, id: 'att-1' });
    await attemptRepo.record(db, { ...a, id: 'att-2', questionId: 'q-gen' });
    const ev = await attemptRepo.masteryAttempts(db, IDS.chapter.gravitation);
    expect(ev).toHaveLength(2);
    expect(ev.filter((e) => e.verified)).toHaveLength(1);
  });
});

describe('home data', () => {
  it('shows honest empty state: not assessed, content setup recommended, no overdue', async () => {
    const db = await fresh();
    const h = await loadHomeData(db, '2026-11-01');
    expect(h.chapters.every((c) => c.mastery.state === 'not_assessed' && c.mastery.score === null)).toBe(true);
    expect(h.action.kind).toBe('setup_content');
    expect(h.exams.map((e) => e.daysLeft)).toEqual([9, 10]);
    expect(h.plan.cycle.day).toBe(19);
  });
  it('surfaces overdue revisions as the next action', async () => {
    const db = await fresh();
    await mistakeRepo.add(db, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionText: 'abc?', category: 'careless' }, '2026-10-20');
    const h = await loadHomeData(db, '2026-11-01');
    expect(h.overdueRevisions).toBe(1);
    expect(h.action.kind).toBe('revise_mistakes');
  });
});

describe('sync outbox', () => {
  const owner = '00000000-0000-4000-8000-000000000001';
  const okRemote = (log: { table: string; row: Record<string, unknown> }[]): RemoteWriter => ({
    upsert: async (table, row) => { log.push({ table, row }); return { error: null }; },
  });
  it('pushes queued rows once, clears the queue, stamps last-synced, and sets owner', async () => {
    const db = await fresh();
    await mistakeRepo.add(db, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionText: 'abc?', category: 'careless' }, '2026-11-01');
    const log: { table: string; row: Record<string, unknown> }[] = [];
    const r1 = await pushOutbox(db, okRemote(log), owner);
    expect(r1).toEqual({ pushed: 2, failed: 0, pending: 0 });
    expect(log.every((l) => l.row.owner_id === owner)).toBe(true);
    expect(log.find((l) => l.table === 'mistake_entries')!.row.ocr_confirmed).toBe(true);
    expect((await pushOutbox(db, okRemote(log), owner)).pushed).toBe(0);
    expect(await db.first("SELECT value FROM app_meta WHERE key='last_synced_at'")).not.toBeNull();
  });
  it('keeps failed rows with backoff and retries later without losing data', async () => {
    const db = await fresh();
    await mistakeRepo.add(db, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionText: 'abc?', category: 'careless' }, '2026-11-01');
    const bad: RemoteWriter = { upsert: async () => ({ error: { message: 'offline' } }) };
    const t0 = Date.now();
    expect(await pushOutbox(db, bad, owner, t0)).toMatchObject({ pushed: 0, failed: 2, pending: 2 });
    expect((await pushOutbox(db, okRemote([]), owner, t0)).pushed).toBe(0); // still backing off
    expect((await pushOutbox(db, okRemote([]), owner, t0 + 10 * 60_000)).pushed).toBe(2);
  });
  it('coalesces repeated edits of one row into a single queued upload', async () => {
    const db = await fresh();
    const id = await mistakeRepo.add(db, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionText: 'abc?', category: 'careless' }, '2026-11-01');
    await mistakeRepo.review(db, id, 'correct', '2026-11-02');
    await mistakeRepo.review(db, id, 'correct', '2026-11-05');
    const n = await db.first<{ n: number }>("SELECT COUNT(*) n FROM sync_outbox WHERE table_name='revision_schedule'");
    expect(n!.n).toBe(1);
  });
});

describe('question bank', () => {
  const mcq = { chapterId: IDS.chapter.gravitation, type: 'single' as const, stem: 'Which law gives F = Gm1m2/r^2?', options: ['Kepler', 'Newton gravitation', 'Hooke'], correct: ['B'], explanation: 'Newton.', hint: 'Think of apples.' };

  it('stores the answer key apart from the question, and list queries never expose it', async () => {
    const db = await fresh();
    const id = await questionRepo.add(db, { ...mcq, verified: true });
    const list = await questionRepo.list(db);
    expect(list).toHaveLength(1);
    expect(JSON.stringify(list[0])).not.toMatch(/Newton\./); // explanation not in list
    expect(Object.keys(list[0])).not.toContain('correct');
    expect((await questionRepo.keys(db, [id]))[id]).toEqual({ correct: ['B'] });
    expect(list[0].hasHint).toBe(true);
  });
  it('keeps unconfirmed questions out of the practice bank and counts them', async () => {
    const db = await fresh();
    await questionRepo.add(db, mcq);
    expect(await questionRepo.list(db)).toHaveLength(0);
    expect(await questionRepo.list(db, { verifiedOnly: false })).toHaveLength(1);
    expect(await questionRepo.unverifiedCount(db)).toBe(1);
  });
  it('validates answer keys', async () => {
    const db = await fresh();
    await expect(questionRepo.add(db, { ...mcq, correct: [] })).rejects.toThrow();
    await expect(questionRepo.add(db, { ...mcq, correct: ['E'] })).rejects.toThrow();
    await expect(questionRepo.add(db, { ...mcq, correct: ['A', 'B'] })).rejects.toThrow();
    await expect(questionRepo.add(db, { ...mcq, options: ['only one'] })).rejects.toThrow();
    await expect(questionRepo.add(db, { ...mcq, type: 'integer', numeric: null })).rejects.toThrow();
    await expect(questionRepo.add(db, { ...mcq, correct: ['A', 'C'], type: 'multi' })).resolves.toBeTruthy();
  });
  it('makes chapter practice visible to the mastery model only once verified', async () => {
    const db = await fresh();
    const id = await questionRepo.add(db, { ...mcq, verified: true });
    await attemptRepo.record(db, { questionId: id, kind: 'practice', outcome: 'correct', marks: 4, timeMs: 1000 });
    const ev = await attemptRepo.masteryAttempts(db, IDS.chapter.gravitation);
    expect(ev).toHaveLength(1);
    expect(ev[0].verified).toBe(true);
  });
});

describe('mock attempts and session recovery', () => {
  const config = { name: 'Quick', style: 'main' as const, durationMinutes: 30, negativeMarkingEnabled: true, sections: [] };
  const result = { questions: [], subjects: [], totalMarks: 8, maxMarks: 16, percentage: 50, accuracy: 100, attemptRate: 50, correct: 2, partial: 0, incorrect: 0, unanswered: 2, negativeLost: 0, totalTimeMs: 1000, avgTimePerAttemptedMs: 500 };

  it('saves a result once even if the save is replayed', async () => {
    const db = await fresh();
    const a = { id: 'sess-1', name: 'Quick', config, startedAt: 1_000, finishedAt: 61_000, result };
    await mockRepo.saveResult(db, a);
    await mockRepo.saveResult(db, a);
    const h = await mockRepo.history(db);
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ total_marks: 8, max_marks: 16, percentage: 50, accuracy: 100 });
    expect((await db.all("SELECT * FROM sync_outbox WHERE table_name='mock_attempts'"))).toHaveLength(1);
  });
  it('persists and clears the active session', async () => {
    const db = await fresh();
    expect(await mockRepo.loadActive(db)).toBeNull();
    await mockRepo.saveActive(db, { id: 's', name: 'n', mode: 'timed', config, questions: [], session: { index: 2 } as never });
    expect((await mockRepo.loadActive(db))!.session).toEqual({ index: 2 });
    await mockRepo.clearActive(db);
    expect(await mockRepo.loadActive(db)).toBeNull();
  });
});

describe('attempt ids', () => {
  it('are valid UUIDs, deterministic per session+question, and distinct across both', () => {
    const a = attemptIdFor('b8f4c1de-0000-4000-8000-000000000001', 'c1');
    expect(a).toMatch(UUID_RE);
    expect(attemptIdFor('b8f4c1de-0000-4000-8000-000000000001', 'c1')).toBe(a);
    expect(attemptIdFor('b8f4c1de-0000-4000-8000-000000000001', 'c2')).not.toBe(a);
    expect(attemptIdFor('b8f4c1de-0000-4000-8000-000000000002', 'c1')).not.toBe(a);
  });
});

describe('practice flow end to end (no UI)', () => {
  it('bank → select → build → play → score → attempts → mastery evidence → error book', async () => {
    const db = await fresh();
    const mk = (stem: string, correct: string[], difficulty: 'foundation' | 'main' | 'advanced') =>
      questionRepo.add(db, { chapterId: IDS.chapter.gravitation, type: 'single', stem, options: ['a', 'b', 'c'], correct, difficulty, verified: true, explanation: 'because' });
    const ids = [await mk('Foundation question one?', ['A'], 'foundation'), await mk('Main question two here?', ['B'], 'main'), await mk('Advanced question three?', ['C'], 'advanced')];
    await questionRepo.add(db, { chapterId: IDS.chapter.gravitation, type: 'single', stem: 'Unconfirmed question?', options: ['a', 'b'], correct: ['A'] });

    const bank = questionRepo.toBank(await questionRepo.list(db));
    const picked = selectQuestions(bank, { count: 10, progressive: true });
    expect(picked.map((q) => q.difficulty)).toEqual(['foundation', 'main', 'advanced']); // unverified excluded, easy → hard
    const keys = await questionRepo.keys(db, picked.map((q) => q.id));
    const { config, questions } = buildCustomExam('t', picked, keys, { correct: 4, incorrect: -1, partialPerCorrectOption: null }, 10);

    let s = startSession(questions.map((q) => q.id), 0, 600_000);
    s = answer(s, { selected: ['A'] }, 1000);              // right
    s = goTo(s, 1, 2000); s = answer(s, { selected: ['C'] }, 3000); // wrong
    s = finish(s, 9000);                                    // third skipped
    const r = scoreExam({ config, questions, responses: s.responses, timeMs: s.timeMs });
    expect([r.totalMarks, r.maxMarks, r.accuracy]).toEqual([3, 12, 50]);

    for (const q of r.questions) await attemptRepo.record(db, { id: `x:${q.questionId}`, questionId: q.questionId, kind: 'exam', outcome: q.outcome, marks: q.marks, timeMs: q.timeMs });
    for (const q of r.questions) await attemptRepo.record(db, { id: `x:${q.questionId}`, questionId: q.questionId, kind: 'exam', outcome: q.outcome, marks: q.marks, timeMs: q.timeMs }); // replay
    expect((await db.first<{ n: number }>('SELECT COUNT(*) n FROM question_attempts'))!.n).toBe(3);
    // skipped questions are not evidence for mastery
    expect(await attemptRepo.masteryAttempts(db, IDS.chapter.gravitation)).toHaveLength(2);

    const wrong = r.questions.find((q) => q.outcome === 'incorrect')!;
    await mistakeRepo.add(db, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionId: wrong.questionId, questionText: 'Main question two here?', correctAnswer: 'B', category: 'conceptual' }, '2026-11-02');
    const [m] = await mistakeRepo.list(db);
    expect(m.dueOn).toBe('2026-11-03');
    expect((await db.first<{ question_id: string }>('SELECT question_id FROM mistake_entries'))!.question_id).toBe(ids[1]);
  });
});
