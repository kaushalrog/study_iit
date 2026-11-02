import { DatabaseSync } from 'node:sqlite';
import type { SqlDb, SqlValue } from '../../src/database/sqlite/types';

/** In-memory SQLite (Node built-in) behind the same SqlDb interface the app uses with expo-sqlite. */
export function memoryDb(): SqlDb {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  let depth = 0;
  return {
    exec: async (sql) => { db.exec(sql); },
    run: async (sql, p: SqlValue[] = []) => { db.prepare(sql).run(...p); },
    all: async (sql, p: SqlValue[] = []) => db.prepare(sql).all(...p) as never,
    first: async (sql, p: SqlValue[] = []) => ((db.prepare(sql).get(...p) as never) ?? null),
    tx: async (fn) => {
      if (depth > 0) return fn();
      depth++;
      db.exec('BEGIN');
      try { const out = await fn(); db.exec('COMMIT'); return out; } catch (e) { db.exec('ROLLBACK'); throw e; } finally { depth--; }
    },
  };
}
