import type { SqlDb, SqlValue } from '../../database/sqlite/types';
import { newId } from '../../utils/ids';
import { BOOL_COLS, JSON_ALIAS, LOCAL_ONLY_COLS, pushOutbox, RemoteWriter, SYNC_ORDER } from './outbox';

/** Everything the engine needs from the server, so it can be tested against an in-memory fake. */
export interface RemoteStore extends RemoteWriter {
  /** Rows with updated_at >= sinceIso (null = from the start), oldest first. RLS limits them to this student. */
  pull(table: string, sinceIso: string | null, limit: number): Promise<{ rows: Record<string, unknown>[]; error: { message: string } | null }>;
}

/**
 * Rows that are only ever added, never edited, are inserted if missing and never overwritten.
 * This is how historical attempts are protected from being clobbered by a stale device.
 */
export const APPEND_ONLY = new Set(['question_attempts', 'mock_attempts', 'ai_messages', 'study_sessions']);

export const PAGE = 500;

export type MergeOutcome = 'inserted' | 'updated' | 'unchanged' | 'kept_local' | 'conflict' | 'failed';

export interface SyncResult {
  status: 'ok' | 'partial' | 'wrong_account' | 'failed';
  pushed: number;
  pushFailed: number;
  pending: number;
  pulled: { inserted: number; updated: number; conflicts: number; failed: number };
  message?: string;
}

const ms = (v: unknown): number => {
  const t = typeof v === 'string' || typeof v === 'number' ? new Date(v).getTime() : NaN;
  return Number.isFinite(t) ? t : 0;
};
const iso = (v: unknown): string | null => { const t = ms(v); return t ? new Date(t).toISOString() : null; };

const colCache = new WeakMap<SqlDb, Map<string, string[]>>();
async function localColumns(db: SqlDb, table: string): Promise<string[]> {
  let m = colCache.get(db);
  if (!m) { m = new Map(); colCache.set(db, m); }
  const hit = m.get(table);
  if (hit) return hit;
  const cols = (await db.all<{ name: string }>(`PRAGMA table_info(${table})`)).map((c) => c.name);
  m.set(table, cols);
  return cols;
}

/** Postgres row -> values for each local column (undefined = remote does not carry it, so leave it alone). */
export async function toLocalValues(db: SqlDb, table: string, remote: Record<string, unknown>): Promise<Record<string, SqlValue>> {
  const out: Record<string, SqlValue> = {};
  for (const col of await localColumns(db, table)) {
    if (LOCAL_ONLY_COLS.includes(col)) continue;
    const key = col in JSON_ALIAS ? JSON_ALIAS[col] : col;
    if (!(key in remote)) continue;
    const v = remote[key];
    if (v === null || v === undefined) out[col] = null;
    else if (BOOL_COLS.has(col)) out[col] = v ? 1 : 0;
    else if (col in JSON_ALIAS) out[col] = JSON.stringify(v);
    else if (col.endsWith('_at')) out[col] = iso(v);
    else if (typeof v === 'boolean') out[col] = v ? 1 : 0;
    else if (typeof v === 'object') out[col] = JSON.stringify(v);
    else out[col] = v as SqlValue;
  }
  return out;
}

async function hasPending(db: SqlDb, table: string, id: string): Promise<boolean> {
  return !!(await db.first('SELECT 1 AS x FROM sync_outbox WHERE table_name = ? AND row_id = ?', [table, id]));
}

/**
 * Merge one server row into SQLite WITHOUT queuing it for upload (it already came from the server).
 *
 * Rules (documented in README):
 *  - unknown row            -> insert
 *  - append-only table      -> never overwrite
 *  - identical timestamps   -> no-op (makes re-pulls idempotent)
 *  - local has unsynced edit and is newer or equal -> keep local; it will be pushed
 *  - local has unsynced edit but remote is newer   -> remote wins, and the losing local version is saved in sync_conflicts
 *  - no local edit pending  -> newer side wins (last write wins by updated_at)
 */
export async function mergeRemoteRow(db: SqlDb, table: string, remote: Record<string, unknown>): Promise<MergeOutcome> {
  const id = String(remote.id ?? '');
  if (!id) return 'failed';
  const vals = await toLocalValues(db, table, remote);
  const local = await db.first<Record<string, unknown>>(`SELECT * FROM ${table} WHERE id = ?`, [id]);

  try {
    if (!local) {
      const cols = Object.keys(vals);
      await db.run(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, cols.map((c) => vals[c]));
      return 'inserted';
    }
    if (APPEND_ONLY.has(table)) return 'unchanged';

    const rts = ms(remote.updated_at);
    const lts = ms(local.updated_at);
    if (rts === lts) return 'unchanged';

    const pending = await hasPending(db, table, id);
    if (pending && lts >= rts) return 'kept_local';
    if (!pending && lts > rts) return 'kept_local';

    return await db.tx(async () => {
      let outcome: MergeOutcome = 'updated';
      if (pending) {
        await db.run('INSERT INTO sync_conflicts (id, table_name, row_id, local_payload_json, remote_payload_json, resolution) VALUES (?, ?, ?, ?, ?, ?)',
          [newId(), table, id, JSON.stringify(local), JSON.stringify(remote), 'remote_won']);
        await db.run('DELETE FROM sync_outbox WHERE table_name = ? AND row_id = ?', [table, id]);
        outcome = 'conflict';
      }
      const cols = Object.keys(vals).filter((c) => c !== 'id');
      if (cols.length) await db.run(`UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`, [...cols.map((c) => vals[c]), id]);
      return outcome;
    });
  } catch {
    // e.g. a foreign key to a row that has not arrived yet; the cursor is held back so it is retried.
    return 'failed';
  }
}

const meta = async (db: SqlDb, key: string) => (await db.first<{ value: string }>('SELECT value FROM app_meta WHERE key = ?', [key]))?.value ?? null;
const setMeta = (db: SqlDb, key: string, value: string) => db.run('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)', [key, value]);

/** Pull every table in dependency order. Returns, for a first sync, the remote id -> updated_at map used for the backfill. */
export async function pullAll(db: SqlDb, remote: RemoteStore, collectStamps: boolean) {
  const stats = { inserted: 0, updated: 0, conflicts: 0, failed: 0 };
  const stamps = new Map<string, number>();
  const errors: string[] = [];

  for (const table of SYNC_ORDER) {
    const cursorKey = `pull_cursor:${table}`;
    let cursor = await meta(db, cursorKey);
    let held: number | null = null; // earliest failed row: do not move the cursor past it
    let maxSeen = cursor ? ms(cursor) : 0;

    for (;;) {
      const { rows, error } = await remote.pull(table, cursor, PAGE);
      if (error) { errors.push(`${table}: ${error.message}`); stats.failed++; break; }
      for (const r of rows) {
        const outcome = await mergeRemoteRow(db, table, r);
        const t = ms(r.updated_at);
        if (collectStamps) stamps.set(`${table}|${r.id}`, t);
        if (outcome === 'failed') { stats.failed++; held = held === null ? t : Math.min(held, t); continue; }
        if (outcome === 'inserted') stats.inserted++;
        else if (outcome === 'updated') stats.updated++;
        else if (outcome === 'conflict') { stats.conflicts++; stats.updated++; }
        maxSeen = Math.max(maxSeen, t);
      }
      const next = held !== null ? new Date(Math.max(0, held - 1)).toISOString() : maxSeen ? new Date(maxSeen).toISOString() : cursor;
      const advanced = next !== cursor;
      cursor = next;
      if (rows.length < PAGE || !advanced) break;
    }
    if (cursor) await setMeta(db, cursorKey, held !== null ? new Date(Math.max(0, held - 1)).toISOString() : cursor);
  }
  return { stats, stamps, errors };
}

/**
 * First sync only: queue local rows the server does not have (or has an older copy of).
 * Done after the pull so a fresh second device never overwrites newer server data with its seed rows.
 */
export async function backfill(db: SqlDb, stamps: Map<string, number>): Promise<number> {
  let queued = 0;
  for (const table of SYNC_ORDER) {
    const rows = await db.all<Record<string, unknown>>(`SELECT * FROM ${table}`);
    for (const row of rows) {
      const remoteTs = stamps.get(`${table}|${row.id}`);
      if (remoteTs !== undefined && ms(row.updated_at) <= remoteTs) continue;
      if (await hasPending(db, table, String(row.id))) continue;
      await db.run(`INSERT OR REPLACE INTO sync_outbox (id, table_name, row_id, op, payload_json) VALUES (?, ?, ?, 'upsert', ?)`,
        [newId(), table, String(row.id), JSON.stringify(row)]);
      queued++;
    }
  }
  return queued;
}

/**
 * One full sync: pull, then push. Pulling first means conflicts with unsynced local edits are detected
 * before those edits are uploaded. Safe to call repeatedly and from two devices at once.
 */
export async function syncOnce(db: SqlDb, remote: RemoteStore, ownerId: string, now = Date.now()): Promise<SyncResult> {
  const empty = { inserted: 0, updated: 0, conflicts: 0, failed: 0 };

  // One account per device: never mix two students' records in one database.
  const bound = await meta(db, 'sync_owner');
  if (bound && bound !== ownerId) {
    return { status: 'wrong_account', pushed: 0, pushFailed: 0, pending: 0, pulled: empty, message: 'This device already holds another account\'s data. Sign in with that account, or use a fresh install.' };
  }
  if (!bound) await setMeta(db, 'sync_owner', ownerId);

  const first = !(await meta(db, 'sync_backfilled_v1'));
  const { stats, stamps, errors } = await pullAll(db, remote, first);
  if (first && errors.length === 0) { await backfill(db, stamps); await setMeta(db, 'sync_backfilled_v1', new Date(now).toISOString()); }

  const push = await pushOutbox(db, remote, ownerId, now);
  const ok = errors.length === 0 && stats.failed === 0 && push.failed === 0;
  if (ok) await setMeta(db, 'last_synced_at', new Date(now).toISOString());
  const failedAll = errors.length > 0 && push.pushed === 0 && stats.inserted + stats.updated === 0;
  return {
    status: ok ? 'ok' : failedAll ? 'failed' : 'partial',
    pushed: push.pushed, pushFailed: push.failed, pending: push.pending, pulled: stats,
    message: errors[0],
  };
}
