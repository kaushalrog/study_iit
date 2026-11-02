import * as SQLite from 'expo-sqlite';
import type { SqlDb, SqlValue } from './types';

export async function openExpoDb(name = 'orbit.db'): Promise<SqlDb> {
  const db = await SQLite.openDatabaseAsync(name);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  let depth = 0;
  return {
    exec: (sql) => db.execAsync(sql),
    run: async (sql, params = []) => { await db.runAsync(sql, params as SqlValue[]); },
    all: (sql, params = []) => db.getAllAsync(sql, params as SqlValue[]) as Promise<never>,
    first: (sql, params = []) => db.getFirstAsync(sql, params as SqlValue[]) as Promise<never>,
    tx: async (fn) => {
      if (depth > 0) return fn(); // already inside a transaction
      depth++;
      await db.execAsync('BEGIN');
      try {
        const out = await fn();
        await db.execAsync('COMMIT');
        return out;
      } catch (e) {
        await db.execAsync('ROLLBACK');
        throw e;
      } finally {
        depth--;
      }
    },
  };
}
