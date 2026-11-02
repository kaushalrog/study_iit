/** @jest-environment node */
/**
 * Runs against a REAL Supabase project (Auth + PostgREST + RLS) with a throwaway test user.
 * Opt-in: needs ORBIT_CLOUD_URL, ORBIT_CLOUD_KEY, ORBIT_CLOUD_EMAIL, ORBIT_CLOUD_PASSWORD (see `npm run test:cloud`).
 * Use a DEVELOPMENT project: seed rows use fixed ids, so this user's rows are removed afterwards to avoid blocking the real student.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { migrate } from '../../src/database/migrations';
import { attemptRepo } from '../../src/database/repositories/attempts';
import { examRepo } from '../../src/database/repositories/exams';
import { mistakeRepo } from '../../src/database/repositories/mistakes';
import { notesRepo } from '../../src/database/repositories/notes';
import { questionRepo } from '../../src/database/repositories/questions';
import { IDS, seedInitialData } from '../../src/database/seed';
import type { SqlDb } from '../../src/database/sqlite/types';
import { describeAuthError } from '../../src/services/auth/errors';
import { syncOnce } from '../../src/services/sync/engine';
import { supabaseRemote } from '../../src/services/sync/supabaseRemote';
import { memoryDb } from '../unit/sqlite-harness';

const { ORBIT_CLOUD_URL: URL, ORBIT_CLOUD_KEY: KEY, ORBIT_CLOUD_EMAIL: EMAIL, ORBIT_CLOUD_PASSWORD: PASSWORD, ORBIT_CLOUD_EMAIL2: EMAIL2, ORBIT_CLOUD_PASSWORD2: PASSWORD2 } = process.env;
const ENABLED = !!(URL && KEY && EMAIL && PASSWORD);
const d = ENABLED ? describe : describe.skip;
jest.setTimeout(180_000);

const mk = () => createClient(URL!, KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
const sleep = (n = 40) => new Promise((r) => setTimeout(r, n));
async function device(): Promise<SqlDb> { const db = memoryDb(); await migrate(db); await seedInitialData(db); return db; }
const why = async (db: SqlDb) => (await db.all<{ table_name: string; last_error: string }>('SELECT table_name, last_error FROM sync_outbox WHERE last_error IS NOT NULL')).map((e) => `${e.table_name}: ${e.last_error}`);

/** Child-first, as the signed-in user (RLS lets owners delete their own rows). */
const CLEAN_ORDER = ['ai_messages', 'ai_conversations', 'revision_schedule', 'mistake_entries', 'question_attempts', 'mock_attempts', 'exam_subject_results', 'study_sessions', 'study_tasks',
  'topic_mastery', 'question_solutions', 'scoring_rules', 'exam_sections', 'questions', 'notes', 'exams', 'topics', 'exam_templates', 'profiles'];
async function cleanup(c: SupabaseClient) {
  const left: string[] = [];
  for (const t of CLEAN_ORDER) {
    const { error } = await c.from(t).delete().not('id', 'is', null);
    if (error) left.push(`${t}: ${error.message}`);
  }
  return left;
}

d('CLOUD: real Supabase project', () => {
  let user: SupabaseClient;
  let uid = '';

  beforeAll(async () => {
    user = mk();
    const { data, error } = await user.auth.signInWithPassword({ email: EMAIL!, password: PASSWORD! });
    if (error || !data.user) throw new Error(`Could not sign in the test user: ${error?.message}. Create it in Authentication > Users (auto-confirm) and check .env.cloud-test.`);
    uid = data.user.id;
    expect(await cleanup(user)).toEqual([]); // start from a clean slate for this user
  });
  afterAll(async () => { if (user) { const left = await cleanup(user); await user.auth.signOut(); if (left.length) console.warn('cleanup left rows:', left); } });

  it('setup is in place: shared chapters and subjects are readable once signed in', async () => {
    const ch = await user.from('chapters').select('title').order('sort_order');
    expect(ch.error).toBeNull();
    expect(ch.data!.map((r) => r.title).sort()).toEqual(['Binomial Theorem', 'Chemical Kinetics', 'Gravitation', 'Inverse Trigonometry']);
    expect((await user.from('subjects').select('key')).data).toHaveLength(3);
  });

  describe('signed out', () => {
    it('sees and changes nothing', async () => {
      const anon = mk();
      for (const t of ['chapters', 'mistake_entries', 'question_solutions', 'mock_attempts', 'exams']) {
        const { data, error } = await anon.from(t).select('id').limit(1);
        expect([t, (data ?? []).length, error ? 'denied' : 'empty']).toEqual([t, 0, expect.stringMatching(/denied|empty/)]);
      }
      const ins = await anon.from('mistake_entries').insert({ id: '99999999-9999-4999-8999-999999999999', subject_key: 'physics', question_text: 'x?', category: 'careless' });
      expect(ins.error).not.toBeNull();
    });
  });

  describe('Auth', () => {
    it('rejects a wrong password with a plain-English message that leaks nothing', async () => {
      const { error } = await mk().auth.signInWithPassword({ email: EMAIL!, password: 'definitely-wrong-password' });
      expect(error).not.toBeNull();
      const msg = describeAuthError(error);
      expect(msg).toMatch(/not right|Too many/);
      expect(msg).not.toMatch(new RegExp(EMAIL!, 'i'));
    });
    it('issues a session whose user id matches what the server stamps as owner', async () => {
      const id = '88888888-8888-4888-8888-888888888888';
      const ins = await user.from('notes').insert({ id, body: 'owner check' }).select('owner_id').single();
      expect(ins.error).toBeNull();
      expect(ins.data!.owner_id).toBe(uid);
    });
  });

  describe('row-level security through PostgREST', () => {
    it('refuses writes to shared data and refuses self-publishing', async () => {
      const chap = (await user.from('chapters').select('id').limit(1)).data![0].id as string;
      expect((await user.from('chapters').update({ title: 'hacked' }).eq('id', chap).select()).data ?? []).toHaveLength(0);
      expect((await user.from('subjects').delete().not('id', 'is', null).select()).data ?? []).toHaveLength(0);
      const pub = await user.from('questions').insert({ id: '77777777-7777-4777-8777-777777777777', chapter_id: chap, type: 'single', stem: 'sneaky', verification_status: 'published' });
      expect(pub.error).not.toBeNull();
    });
    it('cannot create a row owned by someone else', async () => {
      const r = await user.from('notes').insert({ id: '66666666-6666-4666-8666-666666666666', owner_id: '00000000-0000-4000-8000-000000000001', body: 'forged owner' });
      expect(r.error).not.toBeNull();
    });
    (EMAIL2 && PASSWORD2 ? it : it.skip)('a second student cannot see this student\'s rows', async () => {
      await user.from('notes').upsert({ id: '55555555-5555-4555-8555-555555555555', body: 'private' });
      const other = mk();
      const s = await other.auth.signInWithPassword({ email: EMAIL2!, password: PASSWORD2! });
      expect(s.error).toBeNull();
      expect((await other.from('notes').select('id')).data ?? []).toHaveLength(0);
      expect((await other.from('notes').update({ body: 'hijack' }).eq('id', '55555555-5555-4555-8555-555555555555').select()).data ?? []).toHaveLength(0);
      await other.auth.signOut();
    });
  });

  describe('the real sync engine, two devices, real supabase-js', () => {
    it('round-trips a day of work to the server and a second device, with types intact, then settles', async () => {
      const [phone, tablet] = [await device(), await device()];
      const remote = supabaseRemote(user);

      const qid = await questionRepo.add(phone, { chapterId: IDS.chapter.gravitation, type: 'multi', stem: 'Which are true about gravity?', options: ['Always attractive', 'Depends on mass', 'Needs air', 'Acts at a distance'], correct: ['A', 'B', 'D'], explanation: 'Newton.', hint: 'Think of mass.', verified: true, sourceNote: 'cloud test' });
      await attemptRepo.record(phone, { id: '11111111-aaaa-4aaa-8aaa-111111111111', questionId: qid, kind: 'practice', outcome: 'partial', marks: 2, timeMs: 4200, hintUsed: true, selected: ['A', 'B'] });
      const mid = await mistakeRepo.add(phone, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionId: qid, questionText: 'Why does g fall with height?', correctAnswer: 'B', category: 'conceptual' }, '2026-11-02');
      await notesRepo.add(phone, IDS.chapter.gravitation, 'F = G m1 m2 / r^2', { source: 'ai_tutor', title: 'AI explanation (unverified)' });
      await examRepo.saveManualResult(phone, { examId: IDS.examMain, subjects: [{ subject: 'math', marks: 70, maxMarks: 100 }, { subject: 'physics', marks: 40, maxMarks: 100 }] });

      const r1 = await syncOnce(phone, remote, uid);
      expect([r1.status, await why(phone)]).toEqual(['ok', []]);

      // Server-side truth, read back through the API.
      const srvQ = (await user.from('questions').select('options, verification_status, source_note').eq('id', qid).single()).data!;
      expect(srvQ).toMatchObject({ verification_status: 'verified', source_note: 'cloud test' });
      expect(srvQ.options).toEqual(['Always attractive', 'Depends on mass', 'Needs air', 'Acts at a distance']);
      expect((await user.from('question_solutions').select('answer').eq('question_id', qid).single()).data!.answer).toEqual({ correct: ['A', 'B', 'D'] });
      expect((await user.from('question_attempts').select('hint_used, selected').single()).data).toMatchObject({ hint_used: true, selected: ['A', 'B'] });
      expect((await user.from('exams').select('status, total_score').eq('id', IDS.examMain).single()).data).toMatchObject({ status: 'completed', total_score: 110 });
      expect((await user.from('exam_sections').select('id')).data).toHaveLength(12);

      const r2 = await syncOnce(tablet, remote, uid);
      expect([r2.status, await why(tablet)]).toEqual(['ok', []]);
      expect((await mistakeRepo.list(tablet))[0]).toMatchObject({ id: mid, dueOn: '2026-11-03', category: 'conceptual' });
      expect(await questionRepo.keys(tablet, [qid])).toEqual({ [qid]: { correct: ['A', 'B', 'D'] } });
      expect((await examRepo.history(tablet)).map((h) => h.total_score)).toEqual([110]);

      for (let i = 0; i < 2; i++) { await syncOnce(phone, remote, uid); await syncOnce(tablet, remote, uid); }
      for (const t of ['mistake_entries', 'question_attempts', 'questions', 'revision_schedule', 'notes']) {
        const n = (await phone.first<{ n: number }>(`SELECT COUNT(*) n FROM ${t}`))!.n;
        expect([t, (await tablet.first<{ n: number }>(`SELECT COUNT(*) n FROM ${t}`))!.n]).toEqual([t, n]);
      }
      expect((await user.from('mistake_entries').select('id')).data).toHaveLength(1);
      expect((await user.from('question_attempts').select('id')).data).toHaveLength(1);
      expect((await phone.first<{ n: number }>('SELECT COUNT(*) n FROM sync_outbox'))!.n).toBe(0);
    });

    it('resolves a real edit conflict and keeps the losing version on the device', async () => {
      const [phone, tablet] = [await device(), await device()];
      const remote = supabaseRemote(user);
      const id = await mistakeRepo.add(phone, { subject: 'physics', chapterId: IDS.chapter.gravitation, questionText: 'Conflict?', category: 'careless' }, '2026-11-02');
      await syncOnce(phone, remote, uid); await syncOnce(tablet, remote, uid);
      await mistakeRepo.review(tablet, id, 'correct', '2026-11-03');
      await sleep();
      await mistakeRepo.review(phone, id, 'wrong', '2026-11-03');
      await syncOnce(phone, remote, uid);
      const r = await syncOnce(tablet, remote, uid);
      expect(r.pulled.conflicts).toBe(1);
      expect((await mistakeRepo.list(tablet))[0]).toMatchObject({ consecutiveWrong: 1, dueOn: '2026-11-04' });
      expect((await tablet.first<{ n: number }>('SELECT COUNT(*) n FROM sync_conflicts'))!.n).toBe(1);
    });
  });

  it('INFO: the tutor Edge Function state (not asserted as working; reports what is deployed)', async () => {
    const { data, error } = await user.functions.invoke('tutor', { body: { task: 'explain', message: 'What is gravity?', language: 'en' } });
    const status = error ? (error as { context?: { status?: number } }).context?.status : 200;
    const state = status === 404 ? 'not_deployed' : status === 503 ? 'deployed_but_ai_not_configured' : status === 200 && data?.text ? 'working' : `other(${status})`;
    console.info(`tutor function: ${state}`);
    expect(['not_deployed', 'deployed_but_ai_not_configured', 'working']).toContain(state);
    if (state === 'working') expect(data.meta).toMatchObject({ generated: true, verified: false });
  });
});
