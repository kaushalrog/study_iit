/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { attemptRepo } from '../../src/database/repositories/attempts';
import { examRepo } from '../../src/database/repositories/exams';
import { mistakeRepo } from '../../src/database/repositories/mistakes';
import { questionRepo } from '../../src/database/repositories/questions';
import { IDS, seedInitialData } from '../../src/database/seed';
import type { SqlDb } from '../../src/database/sqlite/types';
import { mergeRemoteRow, RemoteStore, syncOnce } from '../../src/services/sync/engine';
import { memoryDb } from '../unit/sqlite-harness';

const OWNER = '00000000-0000-4000-8000-0000000000aa';
const sleep = (n = 6) => new Promise((r) => setTimeout(r, n));

/** In-memory stand-in for Supabase: id-keyed upsert overwrite, updated_at bump on no-op writes, ordered pull. */
class FakeServer implements RemoteStore {
  tables = new Map<string, Map<string, Record<string, unknown>>>();
  failUpserts = false;
  upsertCalls = 0;
  t(name: string) { if (!this.tables.has(name)) this.tables.set(name, new Map()); return this.tables.get(name)!; }
  async upsert(table: string, row: Record<string, unknown>) {
    this.upsertCalls++;
    if (this.failUpserts) return { error: { message: 'network down' } };
    const prev = this.t(table).get(String(row.id));
    const merged = { ...row };
    if (prev && prev.updated_at === row.updated_at) merged.updated_at = new Date().toISOString();
    this.t(table).set(String(row.id), merged);
    return { error: null };
  }
  async pull(table: string, since: string | null, limit: number) {
    const rows = [...this.t(table).values()]
      .filter((r) => !since || new Date(String(r.updated_at)).getTime() >= new Date(since).getTime())
      .sort((a, b) => new Date(String(a.updated_at)).getTime() - new Date(String(b.updated_at)).getTime())
      .slice(0, limit).map((r) => JSON.parse(JSON.stringify(r)));
    return { rows, error: null };
  }
  count(table: string) { return this.t(table).size; }
}

async function device(): Promise<SqlDb> { const db = memoryDb(); await migrate(db); await seedInitialData(db); return db; }
const count = async (db: SqlDb, table: string) => (await db.first<{ n: number }>(`SELECT COUNT(*) n FROM ${table}`))!.n;
const base = { subject: 'physics' as const, chapterId: IDS.chapter.gravitation, questionText: 'Why does g change with height?', category: 'conceptual' as const };

describe('two devices, one student', () => {
  it('a mistake and its revision schedule written on the phone appear on the tablet, exactly once', async () => {
    const [phone, tablet, server] = [await device(), await device(), new FakeServer()];
    const id = await mistakeRepo.add(phone, base, '2026-11-02');
    expect((await syncOnce(phone, server, OWNER)).status).toBe('ok');
    expect((await syncOnce(tablet, server, OWNER)).status).toBe('ok');

    expect(await mistakeRepo.list(tablet)).toHaveLength(1);
    expect((await mistakeRepo.list(tablet))[0]).toMatchObject({ id, questionText: base.questionText, dueOn: '2026-11-03' });
    // Re-syncing everywhere changes nothing and duplicates nothing.
    for (let i = 0; i < 2; i++) { await syncOnce(phone, server, OWNER); await syncOnce(tablet, server, OWNER); }
    expect(await count(phone, 'mistake_entries')).toBe(1);
    expect(await count(tablet, 'mistake_entries')).toBe(1);
    expect(await count(tablet, 'revision_schedule')).toBe(1);
    expect(server.count('mistake_entries')).toBe(1);
    expect(await count(tablet, 'sync_outbox')).toBe(0);
  });

  it('synced rows are not echoed back to the server as new uploads', async () => {
    const [phone, tablet, server] = [await device(), await device(), new FakeServer()];
    await mistakeRepo.add(phone, base, '2026-11-02');
    await syncOnce(phone, server, OWNER);
    await syncOnce(tablet, server, OWNER);
    const before = server.upsertCalls;
    await syncOnce(tablet, server, OWNER);
    expect(server.upsertCalls).toBe(before);
  });

  it('exam attempts are never duplicated, and a stale device cannot overwrite history', async () => {
    const [phone, tablet, server] = [await device(), await device(), new FakeServer()];
    const qid = await questionRepo.add(phone, { chapterId: IDS.chapter.gravitation, type: 'single', stem: 'Which force holds a satellite?', options: ['Gravity', 'Friction'], correct: ['A'], verified: true });
    await syncOnce(phone, server, OWNER);
    await syncOnce(tablet, server, OWNER);
    expect(await count(tablet, 'questions')).toBe(1);
    expect(await count(tablet, 'question_solutions')).toBe(1);

    await attemptRepo.record(phone, { id: 'att-1', questionId: qid, kind: 'practice', outcome: 'correct', marks: 4, timeMs: 1000 });
    await syncOnce(phone, server, OWNER);
    // The tablet has its own (stale, different) copy of the same attempt id: history must win.
    await tablet.run(`INSERT INTO question_attempts (id, question_id, kind, outcome, marks, time_ms, attempted_at) VALUES ('att-1', ?, 'practice', 'incorrect', -1, 5, '2026-01-01T00:00:00.000Z')`, [qid]);
    await syncOnce(tablet, server, OWNER);
    expect(await count(tablet, 'question_attempts')).toBe(1);
    expect(await count(phone, 'question_attempts')).toBe(1);
    expect(server.count('question_attempts')).toBe(1);
    expect((await tablet.first<{ outcome: string }>("SELECT outcome FROM question_attempts WHERE id='att-1'"))!.outcome).toBe('incorrect'); // never rewritten locally
  });

  describe('conflicts', () => {
    it('last write wins; the newer edit survives on both devices and converges', async () => {
      const [phone, tablet, server] = [await device(), await device(), new FakeServer()];
      const id = await mistakeRepo.add(phone, base, '2026-11-02');
      await syncOnce(phone, server, OWNER); await syncOnce(tablet, server, OWNER);

      await mistakeRepo.review(phone, id, 'correct', '2026-11-03');   // older edit, offline
      await sleep();
      await mistakeRepo.review(tablet, id, 'wrong', '2026-11-03');    // newer edit, offline
      await syncOnce(phone, server, OWNER);                            // phone uploads first
      await syncOnce(tablet, server, OWNER);                           // tablet is newer: keeps its edit and uploads it
      await syncOnce(phone, server, OWNER);

      const a = (await mistakeRepo.list(phone))[0], b = (await mistakeRepo.list(tablet))[0];
      expect(a.dueOn).toBe(b.dueOn);
      expect(b.dueOn).toBe('2026-11-04'); // the "wrong" edit schedules tomorrow's review (relative to 11-03)
      expect(a.consecutiveWrong).toBe(1);
    });

    it('when a remote edit is newer than an unsynced local edit, remote wins and the losing version is kept', async () => {
      const [phone, tablet, server] = [await device(), await device(), new FakeServer()];
      const id = await mistakeRepo.add(phone, base, '2026-11-02');
      await syncOnce(phone, server, OWNER); await syncOnce(tablet, server, OWNER);

      await mistakeRepo.review(tablet, id, 'correct', '2026-11-03');  // older, still unsynced
      await sleep();
      await mistakeRepo.review(phone, id, 'wrong', '2026-11-03');     // newer
      await syncOnce(phone, server, OWNER);
      const r = await syncOnce(tablet, server, OWNER);

      expect(r.pulled.conflicts).toBe(1);
      expect((await mistakeRepo.list(tablet))[0].consecutiveWrong).toBe(1); // phone's edit won
      const lost = await tablet.all<{ table_name: string; resolution: string; local_payload_json: string }>('SELECT * FROM sync_conflicts');
      expect(lost).toHaveLength(1);
      expect(lost[0]).toMatchObject({ table_name: 'revision_schedule', resolution: 'remote_won' });
      expect(JSON.parse(lost[0].local_payload_json).consecutive_wrong).toBe(0); // the discarded local version is preserved
      expect(await count(tablet, 'sync_outbox')).toBe(0); // and is not pushed back over the winner
    });
  });

  describe('first sync on a second device', () => {
    it('does not overwrite a recorded exam result on the server with the new device\'s untouched seed rows', async () => {
      const [phone, tablet, server] = [await device(), await device(), new FakeServer()];
      await sleep();
      await examRepo.saveManualResult(phone, { examId: IDS.examMain, subjects: [{ subject: 'math', marks: 80, maxMarks: 100 }] });
      await syncOnce(phone, server, OWNER);
      await syncOnce(tablet, server, OWNER);
      expect(server.t('exams').get(IDS.examMain)).toMatchObject({ status: 'completed', total_score: 80 });
      expect((await examRepo.history(tablet)).map((h) => h.total_score)).toEqual([80]);
    });

    it('uploads local-only rows from before sign-in once, and not shared reference rows', async () => {
      const [phone, server] = [await device(), new FakeServer()];
      await mistakeRepo.add(phone, base, '2026-11-02');
      const r = await syncOnce(phone, server, OWNER);
      expect(r.status).toBe('ok');
      expect(server.count('mistake_entries')).toBe(1);
      expect(server.count('exams')).toBe(2);
      expect(server.count('exam_templates')).toBe(2);
      expect(server.count('exam_sections')).toBe(12);
      expect(server.tables.has('chapters')).toBe(false);
      expect(server.tables.has('subjects')).toBe(false);
      expect(server.t('exam_sections').values().next().value).not.toHaveProperty('owner_id'); // table has no owner column
      expect(server.t('exam_templates').values().next().value).toMatchObject({ negative_marking_enabled: true }); // boolean, not 1
    });
  });

  it('refuses to mix a different account into this device\'s data', async () => {
    const [phone, server] = [await device(), new FakeServer()];
    await syncOnce(phone, server, OWNER);
    const r = await syncOnce(phone, server, '00000000-0000-4000-8000-0000000000bb');
    expect(r.status).toBe('wrong_account');
    expect(r.message).toMatch(/another account/i);
  });

  it('keeps local data and retries later when the network is down', async () => {
    const [phone, server] = [await device(), new FakeServer()];
    await syncOnce(phone, server, OWNER);
    const stamp = async () => (await phone.first<{ value: string }>("SELECT value FROM app_meta WHERE key='last_synced_at'"))?.value;
    const stampBefore = await stamp();
    await sleep();
    await mistakeRepo.add(phone, base, '2026-11-02');
    server.failUpserts = true;
    const down = await syncOnce(phone, server, OWNER, Date.now());
    expect(down.status).not.toBe('ok');
    expect(down.pending).toBeGreaterThan(0);
    expect(await mistakeRepo.list(phone)).toHaveLength(1); // nothing lost locally
    expect(await stamp()).toBe(stampBefore); // a failed sync must not claim success
    server.failUpserts = false;
    const up = await syncOnce(phone, server, OWNER, Date.now() + 60 * 60_000); // after the backoff
    expect(up.status).toBe('ok');
    expect(server.count('mistake_entries')).toBe(1);
    expect(await stamp()).not.toBe(stampBefore);
  });

  it('holds back rows whose parent has not arrived instead of losing them, then merges them later', async () => {
    const [tablet, server] = [await device(), new FakeServer()];
    const orphan = { id: 'ma-1', owner_id: OWNER, subject_key: 'physics', chapter_id: 'missing-chapter', topic_id: null, question_id: null, question_text: 'x?', category: 'careless', ocr_confirmed: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null };
    server.t('mistake_entries').set('ma-1', orphan);
    const r1 = await syncOnce(tablet, server, OWNER);
    expect(r1.status).toBe('partial');
    expect(r1.pulled.failed).toBe(1);
    expect(await count(tablet, 'mistake_entries')).toBe(0);
    server.t('mistake_entries').set('ma-1', { ...orphan, chapter_id: IDS.chapter.gravitation });
    await sleep();
    const r2 = await syncOnce(tablet, server, OWNER);
    expect(r2.pulled.inserted).toBe(1);
    expect(await count(tablet, 'mistake_entries')).toBe(1);
  });

  it('mergeRemoteRow converts types: booleans, jsonb, timestamps', async () => {
    const db = await device();
    await mergeRemoteRow(db, 'exam_templates', { id: 'tpl-x', name: 'Custom', style: 'main', duration_minutes: 90, negative_marking_enabled: false, source_note: null, verification_status: 'draft',
      created_at: '2026-11-02T10:00:00+00:00', updated_at: '2026-11-02T10:00:00+00:00', owner_id: OWNER });
    const row = (await db.first<Record<string, unknown>>("SELECT * FROM exam_templates WHERE id='tpl-x'"))!;
    expect(row.negative_marking_enabled).toBe(0);
    expect(row.updated_at).toBe('2026-11-02T10:00:00.000Z');
    await mergeRemoteRow(db, 'exams', { id: 'ex-x', name: 'E', style: 'main', exam_date: '2026-12-01', syllabus: [{ chapterId: 'c', title: 'T', subject: 'math' }], status: 'scheduled', entry_mode: 'engine',
      updated_at: '2026-11-02T10:00:00Z', created_at: '2026-11-02T10:00:00Z', owner_id: OWNER });
    const ex = (await db.first<Record<string, unknown>>("SELECT * FROM exams WHERE id='ex-x'"))!;
    expect(JSON.parse(ex.syllabus_json as string)[0].title).toBe('T');
  });
});
