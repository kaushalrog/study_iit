/** Minimal driver interface so repositories run on expo-sqlite in the app and node:sqlite in tests. */
export type SqlValue = string | number | null;

export interface SqlDb {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlValue[]): Promise<void>;
  all<T = Record<string, unknown>>(sql: string, params?: SqlValue[]): Promise<T[]>;
  first<T = Record<string, unknown>>(sql: string, params?: SqlValue[]): Promise<T | null>;
  /** Run fn atomically; rolls back on throw. */
  tx<T>(fn: () => Promise<T>): Promise<T>;
}
