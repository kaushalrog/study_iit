/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { attemptRepo } from '../../src/database/repositories/attempts';
import { examRepo } from '../../src/database/repositories/exams';
import { mistakeRepo } from '../../src/database/repositories/mistakes';
import { mockRepo } from '../../src/database/repositories/mocks';
import { notesRepo } from '../../src/database/repositories/notes';
import { questionRepo } from '../../src/database/repositories/questions';
import { IDS, seedInitialData } from '../../src/database/seed';
import type { SqlDb } from '../../src/database/sqlite/types';
import { RemoteStore, syncOnce } from '../../src/services/sync/engine';
import { JSON_ALIAS, LOCAL_ONLY_COLS, NO_OWNER, SYNC_ORDER } from '../../src/services/sync/outbox';
import { memoryDb } from '../unit/sqlite-harness';
import { as, ensureUser, exec, LIVE, newUuid, reset, select } from './pg';

jest.setTimeout(120_000);
const STUDENT = '33333333-3333-4333-8333-333333333333';
const OTHER = '44444444-4444-4444-8444-444444444444';
const sleep = (n = 15) => new Promise((r) => setTimeout(r, n));
const d = LIVE ? describe : describe.skip;

/** Emulates PostgREST against real Postgres: inserts only the columns sent, upserts on id, runs as `authenticated` under RLS. */
function pgRemote(user: string): RemoteStore {
  const tag = () => `$j${Math.random().toString(36).slice(2)}$`;
  return {
    async upsert(table, row) {
      const cols = Object.keys(row);
      const t = tag();
      const list = cols.map((c) => `"${c}"`).join(', ');
      const sets = cols.filter((c) => c !== 'id').map((c) => `"${c}" = excluded."${c}"`).join(', ');
      const r = exec(as('authenticated', user),
        `insert into ${table} (${list}) select ${list} from jsonb_populate_record(null::${table}, ${t}${JSON.stringify(row)}${t}::jsonb) on conflict (id) do update set ${sets}`);
      return { error: r.ok ? null : { message: r.error } };
    },
    async pull(table, since, limit) {
      try {
        const rows = select(as('authenticated', user), `select * from ${table} ${since ? `where updated_at >= '${since}'` : ''} order by updated_at asc limit ${limit}`);
        return { rows, error: null };
      } catch (e) { return { rows: [], error: { message: (e as Error).message } }; }
    },
  };
}

async function device(): Promise<SqlDb> { const db = memoryDb(); await migrate(db); await seedInitialData(db); return db; }
const count = async (db: SqlDb, table: string) => (await db.first<{ n: number }>(`SELECT COUNT(*) n FROM ${table}`))!.n;
/** Why rows are stuck, straight from the outbox, so a failure explains itself. */
const why = async (db: SqlDb) => (await db.all<{ table_name: string; last_error: string }>('SELECT table_name, last_error FROM sync_outbox WHERE last_error IS NOT NULL')).map((e) => `${e.table_name}: ${e.last_error.split('\n')[0]}`);
const pgCount = (table: string, owner = STUDENT) => Number(select(as('postgres'), `select count(*)::int as n from ${table} where owner_id='${owner}'`)[0].n);

d('LIVE: sync engine against real Postgres with row-level security', () => {
  beforeAll(() => { ensureUser(STUDENT, 'student@example.test'); ensureUser(OTHER, 'other@example.test'); });
  beforeEach(() => reset());

  it('schema contract: every column the app uploads exists on the server, for every synced table', async () => {
    const db = await device();
    const problems: string[] = [];
    for (const table of SYNC_ORDER) {
      const local = (await db.all<{ name: string }>(`PRAGMA table_info(${table})`)).map((c) => c.name);
      const remote = new Set(select<{ column_name: string }>(as('postgres'), `select column_name from information_schema.columns where table_schema='public' and table_name='${table}'`).map((c) => c.column_name));
      if (remote.size === 0) { problems.push(`${table}: table missing on server`); continue; }
      for (const col of local) {
        if (LOCAL_ONLY_COLS.includes(col) || (NO_OWNER.has(table) && col === 'owner_id')) continue;
        const name = JSON_ALIAS[col] ?? col;
        if (!remote.has(name)) problems.push(`${table}.${name}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('pushes a realistic day of work from the phone and the tablet receives identical records', async () => {
    const [phone, tablet] = [await device(), await device()];
    const remote = pgRemote(STUDENT);

    // Everything a student does in one sitting.
    const qid = await questionRepo.add(phone, { chapterId: IDS.chapter.gravitation, type: 'multi', stem: 'Which are true about gravity?', options: ['Always attractive', 'Depends on mass', 'Needs air', 'Acts at a distance'], correct: ['A', 'B', 'D'], explanation: 'Newton.', hint: 'Think of mass.', difficulty: 'main', verified: true, sourceNote: 'Book p.12' });
    await attemptRepo.record(phone, { id: newUuid(), questionId: qid, kind: 'practice', outcome: 'partial', marks: 2, timeMs: 4200, hintUsed: true, selected: ['A', 'B'] });
    const mid = await mistakeRepo.add(phone, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionId: qid, questionText: 'Why does g fall with height?', correctAnswer: 'B', category: 'conceptual', studentNote: 'revisit' }, '2026-11-02');
    await notesRepo.add(phone, IDS.chapter.gravitation, 'F = G m1 m2 / r^2', { source: 'ai_tutor', title: 'AI explanation (unverified)' });
    await mockRepo.saveResult(phone, { id: newUuid(), name: 'Timed test', config: { name: 'Timed test', style: 'main', durationMinutes: 10, negativeMarkingEnabled: true, sections: [] }, startedAt: Date.now() - 60_000, finishedAt: Date.now(),
      result: { questions: [], subjects: [], totalMarks: 8, maxMarks: 12, percentage: 66.67, accuracy: 100, attemptRate: 50, correct: 2, partial: 0, incorrect: 0, unanswered: 2, negativeLost: 0, totalTimeMs: 60000, avgTimePerAttemptedMs: 30000 } });
    await examRepo.saveManualResult(phone, { examId: IDS.examMain, subjects: [{ subject: 'math', marks: 70, maxMarks: 100 }, { subject: 'physics', marks: 40, maxMarks: 100 }] });

    const r1 = await syncOnce(phone, remote, STUDENT);
    expect([r1.status, await why(phone)]).toEqual(['ok', []]);
    expect(r1.pushFailed).toBe(0);

    // The server really holds it, owned by the student.
    expect(pgCount('mistake_entries')).toBe(1);
    expect(pgCount('question_attempts')).toBe(1);
    expect(pgCount('mock_attempts')).toBe(1);
    expect(pgCount('notes')).toBe(1);
    expect(pgCount('exam_templates')).toBe(2);
    expect(pgCount('exam_subject_results')).toBe(2);
    expect(Number(select(as('postgres'), `select count(*)::int n from exam_sections s join exam_templates t on t.id=s.template_id where t.owner_id='${STUDENT}'`)[0].n)).toBe(12);
    const srvQ = select(as('postgres'), `select options, verification_status, source_note from questions where id='${qid}'`)[0];
    expect(srvQ).toMatchObject({ verification_status: 'verified', source_note: 'Book p.12' });
    expect(srvQ.options).toEqual(['Always attractive', 'Depends on mass', 'Needs air', 'Acts at a distance']); // jsonb array, not a string
    expect(select(as('postgres'), `select answer from question_solutions where question_id='${qid}'`)[0].answer).toEqual({ correct: ['A', 'B', 'D'] });
    expect(select(as('postgres'), `select hint_used, selected from question_attempts`)[0]).toMatchObject({ hint_used: true, selected: ['A', 'B'] }); // boolean + jsonb, not 1 / '["A","B"]'
    expect(select(as('postgres'), `select negative_marking_enabled from exam_templates limit 1`)[0].negative_marking_enabled).toBe(true);
    expect(select(as('postgres'), `select status, total_score from exams where id='${IDS.examMain}'`)[0]).toMatchObject({ status: 'completed', total_score: 110 });

    // Tablet receives it all.
    const r2 = await syncOnce(tablet, remote, STUDENT);
    expect([r2.status, r2.message, await why(tablet)]).toEqual(['ok', undefined, []]);
    expect(await mistakeRepo.list(tablet)).toHaveLength(1);
    expect((await mistakeRepo.list(tablet))[0]).toMatchObject({ id: mid, questionText: 'Why does g fall with height?', dueOn: '2026-11-03', category: 'conceptual' });
    const tq = await questionRepo.list(tablet);
    expect(tq).toHaveLength(1);
    expect(tq[0].options).toEqual(['Always attractive', 'Depends on mass', 'Needs air', 'Acts at a distance']);
    expect(await questionRepo.keys(tablet, [qid])).toEqual({ [qid]: { correct: ['A', 'B', 'D'] } });
    expect((await tablet.first<{ hint_used: number; selected_json: string }>('SELECT hint_used, selected_json FROM question_attempts'))).toEqual({ hint_used: 1, selected_json: '["A","B"]' });
    expect((await mockRepo.history(tablet))[0]).toMatchObject({ total_marks: 8, max_marks: 12 });
    expect((await examRepo.history(tablet)).map((h) => h.total_score)).toEqual([110]);
    expect((await notesRepo.list(tablet, IDS.chapter.gravitation))[0].source).toBe('ai_tutor');

    // Settled: more syncs change nothing anywhere, and nothing is duplicated.
    for (let i = 0; i < 2; i++) { await syncOnce(phone, remote, STUDENT); await syncOnce(tablet, remote, STUDENT); }
    for (const t of ['mistake_entries', 'question_attempts', 'mock_attempts', 'questions', 'revision_schedule', 'notes']) {
      expect([t, await count(phone, t), await count(tablet, t), pgCount(t)]).toEqual([t, await count(phone, t), await count(phone, t), await count(phone, t)]);
    }
    expect(await count(tablet, 'sync_outbox')).toBe(0);
    expect(await count(phone, 'sync_outbox')).toBe(0);
  });

  it('resolves an edit conflict against the real server and keeps the losing version', async () => {
    const [phone, tablet] = [await device(), await device()];
    const remote = pgRemote(STUDENT);
    const id = await mistakeRepo.add(phone, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionText: 'Why?', category: 'careless' }, '2026-11-02');
    await syncOnce(phone, remote, STUDENT); await syncOnce(tablet, remote, STUDENT);

    await mistakeRepo.review(tablet, id, 'correct', '2026-11-03'); // older, offline
    await sleep();
    await mistakeRepo.review(phone, id, 'wrong', '2026-11-03');    // newer, offline
    await syncOnce(phone, remote, STUDENT);
    const r = await syncOnce(tablet, remote, STUDENT);

    expect(r.pulled.conflicts).toBe(1);
    expect((await mistakeRepo.list(tablet))[0]).toMatchObject({ consecutiveWrong: 1, dueOn: '2026-11-04' });
    expect(await count(tablet, 'sync_conflicts')).toBe(1);
    expect(select(as('postgres'), 'select consecutive_wrong, due_on::text from revision_schedule')[0]).toMatchObject({ consecutive_wrong: 1, due_on: '2026-11-04' });
  });

  it('a second device does not overwrite a recorded result on the server with its untouched seed rows', async () => {
    const [phone, tablet] = [await device(), await device()];
    const remote = pgRemote(STUDENT);
    await sleep();
    await examRepo.saveManualResult(phone, { examId: IDS.examMain, subjects: [{ subject: 'math', marks: 80, maxMarks: 100 }] });
    await syncOnce(phone, remote, STUDENT);
    await syncOnce(tablet, remote, STUDENT);
    expect(select(as('postgres'), `select status, total_score from exams where id='${IDS.examMain}'`)[0]).toMatchObject({ status: 'completed', total_score: 80 });
    expect((await examRepo.history(tablet)).map((h) => h.total_score)).toEqual([80]);
  });

  it('another student sees none of this, and cannot disturb it', async () => {
    const phone = await device();
    await mistakeRepo.add(phone, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionText: 'Private?', category: 'careless' }, '2026-11-02');
    await syncOnce(phone, pgRemote(STUDENT), STUDENT);

    const intruder = await device();
    const r = await syncOnce(intruder, pgRemote(OTHER), OTHER);
    expect(await mistakeRepo.list(intruder)).toHaveLength(0);
    expect(r.status).not.toBe('ok'); // seed ids collide with the first student's rows, which RLS (correctly) hides, so the upload is rejected
    expect(pgCount('mistake_entries')).toBe(1);
    expect(pgCount('exam_templates', OTHER)).toBe(0);
    expect(select(as('postgres'), `select count(*)::int n from exams where owner_id='${STUDENT}'`)[0].n).toBe(2); // untouched
  });

  it('keeps working data intact when the server rejects rows (sign-in expired / RLS denial)', async () => {
    const phone = await device();
    await mistakeRepo.add(phone, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionText: 'Keep me', category: 'careless' }, '2026-11-02');
    const r = await syncOnce(phone, pgRemote('55555555-5555-4555-8555-555555555555'), '55555555-5555-4555-8555-555555555555'); // user not in auth.users: FK violation
    expect(r.status).not.toBe('ok');
    expect(await mistakeRepo.list(phone)).toHaveLength(1);
    expect(await count(phone, 'sync_outbox')).toBeGreaterThan(0);
  });
});
