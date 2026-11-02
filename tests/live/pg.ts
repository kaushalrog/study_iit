import { spawnSync } from 'child_process';

/** Live-Postgres helpers. Enabled only when ORBIT_LIVE_PG_PORT is set (see supabase/test/apply.sh). */
export const LIVE = !!process.env.ORBIT_LIVE_PG_PORT;
const PORT = process.env.ORBIT_LIVE_PG_PORT ?? '54329';
const DB = process.env.ORBIT_LIVE_PG_DB ?? 'orbit_live';

export type Role = 'postgres' | 'anon' | 'authenticated' | 'service_role';
export interface Who { role: Role; user?: string }
export const as = (role: Role, user?: string): Who => ({ role, user });

function psql(sql: string): { out: string; err: string; ok: boolean } {
  const r = spawnSync('psql', ['-h', '127.0.0.1', '-p', PORT, '-U', 'postgres', '-d', DB, '-X', '-q', '-At', '-v', 'ON_ERROR_STOP=1'], { input: sql, encoding: 'utf8', env: { ...process.env, LC_ALL: 'en_US.UTF-8' } });
  return { out: r.stdout ?? '', err: (r.stderr ?? '').trim(), ok: r.status === 0 };
}

const wrap = (who: Who, body: string, end: 'commit' | 'rollback' = 'commit') =>
  `begin;\n${who.role === 'postgres' ? '' : `set local role ${who.role};\n`}` +
  `${who.user ? `select set_config('request.jwt.claims', '{"sub":"${who.user}","role":"${who.role}"}', true);\n` : ''}${body.trim().replace(/;+$/, '')};\n${end};`;

/** Run a SELECT as a role/user and return rows (throws with the Postgres error on failure). */
export function select<T = Record<string, unknown>>(who: Who, sql: string): T[] {
  const r = psql(wrap(who, `select coalesce(jsonb_agg(t), '[]'::jsonb) from (${sql}) t;`));
  if (!r.ok) throw new Error(r.err);
  const line = r.out.split('\n').filter((l) => l.startsWith('[')).pop() ?? '[]';
  return JSON.parse(line) as T[];
}

/** Run a statement; returns { ok, error, count } where count is rows affected for INSERT/UPDATE/DELETE. */
/** Pass { rollback: true } for destructive probes so a failing assertion never damages the test database. */
export function exec(who: Who, sql: string, opts: { rollback?: boolean } = {}): { ok: boolean; error: string; count: number } {
  const r = psql(wrap(who, sql, opts.rollback ? 'rollback' : 'commit'));
  const m = /^(?:INSERT \d+|UPDATE|DELETE) (\d+)$/m.exec(r.out);
  return { ok: r.ok, error: r.err, count: m ? Number(m[1]) : 0 };
}

export const sqlStr = (s: string) => `'${s.replace(/'/g, "''")}'`;
export const newUuid = () => require('crypto').randomUUID() as string;

/** Remove every student-owned row (child tables first) without touching shared reference rows. */
export function reset() {
  const tables = ['ai_messages', 'ai_conversations', 'revision_schedule', 'mistake_entries', 'question_attempts', 'mock_attempts', 'exam_subject_results', 'study_sessions', 'study_tasks',
    'topic_mastery', 'question_solutions', 'scoring_rules', 'exam_sections', 'questions', 'notes', 'exams', 'topics', 'exam_templates', 'profiles'];
  psql(tables.map((t) => `delete from ${t};`).join('\n') + "\ndelete from content_sources where owner_id is not null;");
}
export function ensureUser(id: string, email: string) {
  psql(`insert into auth.users (id, email) values ('${id}', '${email}') on conflict do nothing;`);
}
